// @ts-nocheck
const fs = require('fs');
const path = require('path');

function normalize_path(input_path) {
    if (typeof input_path !== 'string') {
        return '';
    }

    if (input_path.startsWith('file://')) {
        const decoded = decodeURIComponent(input_path.replace(/^file:\/\//, ''));
        if (/^\/[A-Za-z]:\//.test(decoded)) {
            return decoded.slice(1).replace(/\//g, '\\');
        }
        return decoded;
    }

    return input_path;
}

function is_executable_path(file_path) {
    const ext = path.extname(file_path).toLowerCase();
    return ['.exe', '.bat', '.cmd', '.com', '.ps1'].includes(ext);
}

function get_content_type(file_path, is_dir) {
    if (is_dir) {
        return 'inode/directory';
    }

    const ext = path.extname(file_path).toLowerCase();
    const table = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.js': 'text/javascript',
        '.ts': 'text/typescript',
        '.html': 'text/html',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.zip': 'application/zip',
        '.gz': 'application/gzip',
        '.tar': 'application/x-tar',
        '.pdf': 'application/pdf'
    };

    return table[ext] || 'application/octet-stream';
}

function safe_stat(target_path) {
    try {
        return fs.lstatSync(target_path);
    } catch (error) {
        return null;
    }
}

function to_file_object(target_path) {
    const normalized = normalize_path(target_path);
    const stat = safe_stat(normalized);

    if (!stat) {
        throw new Error(`Could not get file info: ${normalized}`);
    }

    const is_dir = stat.isDirectory();
    const name = path.basename(normalized);
    const location = path.dirname(normalized);
    const mtime = Math.floor(stat.mtimeMs / 1000);
    const atime = Math.floor(stat.atimeMs / 1000);
    const ctime = Math.floor(stat.ctimeMs / 1000);

    return {
        name,
        display_name: name,
        href: normalized,
        location,
        is_dir,
        is_hidden: name.startsWith('.'),
        is_writable: true,
        is_readable: true,
        is_symlink: stat.isSymbolicLink(),
        content_type: get_content_type(normalized, is_dir),
        size: is_dir ? 0 : Number(stat.size || 0),
        mtime,
        atime,
        ctime,
        filesystem: process.platform === 'win32' ? 'ntfs' : 'unknown',
        owner: 'Unknown',
        group: 'Unknown',
        permissions: Number(stat.mode || 0),
        is_execute: is_executable_path(normalized)
    };
}

function ls_sync(location) {
    const normalized = normalize_path(location);
    const dirents = fs.readdirSync(normalized, { withFileTypes: true });

    return dirents.map((dirent) => {
        const full_path = path.join(normalized, dirent.name);
        const file = to_file_object(full_path);
        file.is_dir = dirent.isDirectory();
        file.is_symlink = dirent.isSymbolicLink();
        return file;
    });
}

function du_recursive(target_path) {
    const normalized = normalize_path(target_path);
    const stat = safe_stat(normalized);

    if (!stat) {
        return 0;
    }

    if (!stat.isDirectory() || stat.isSymbolicLink()) {
        return Number(stat.size || 0);
    }

    let total = 0;
    const dirents = fs.readdirSync(normalized, { withFileTypes: true });
    for (const dirent of dirents) {
        const full_path = path.join(normalized, dirent.name);
        total += du_recursive(full_path);
    }

    return total;
}

function count_recursive(target_path) {
    const normalized = normalize_path(target_path);
    const stat = safe_stat(normalized);

    if (!stat || !stat.isDirectory()) {
        return { files: 0, folders: 0, total: 0 };
    }

    let files = 0;
    let folders = 0;

    const dirents = fs.readdirSync(normalized, { withFileTypes: true });
    for (const dirent of dirents) {
        const full_path = path.join(normalized, dirent.name);
        if (dirent.isDirectory() && !dirent.isSymbolicLink()) {
            folders += 1;
            const child = count_recursive(full_path);
            files += child.files;
            folders += child.folders;
        } else {
            files += 1;
        }
    }

    return { files, folders, total: files + folders };
}

function find_sync(query, location, options = {}) {
    const search = String(query || '').toLowerCase();
    const root = normalize_path(location);
    const min_size = Number.isFinite(Number(options.minSize)) ? Number(options.minSize) : null;
    const max_size = Number.isFinite(Number(options.maxSize)) ? Number(options.maxSize) : null;
    const from_time = options.dateFrom ? new Date(options.dateFrom).getTime() : null;
    const to_time = options.dateTo ? new Date(options.dateTo).getTime() : null;

    const matches = [];

    function walk(current) {
        const entries = ls_sync(current);
        for (const entry of entries) {
            const name_match = entry.name.toLowerCase().includes(search);
            const size_match = (min_size === null || entry.size >= min_size) && (max_size === null || entry.size <= max_size);
            const mtime_ms = entry.mtime ? entry.mtime * 1000 : 0;
            const date_match = (from_time === null || mtime_ms >= from_time) && (to_time === null || mtime_ms <= to_time);

            if (name_match && size_match && date_match) {
                matches.push(entry);
            }

            if (entry.is_dir && !entry.is_symlink) {
                walk(entry.href);
            }
        }
    }

    if (search) {
        walk(root);
    }

    return matches;
}

const watchers = new Map();

const fallback_gio = {
    ls(location, callback) {
        try {
            const files = ls_sync(location);
            callback(null, files);
        } catch (error) {
            callback(error);
        }
    },

    get_file(target_path) {
        return to_file_object(target_path);
    },

    mkdir(target_path) {
        fs.mkdirSync(normalize_path(target_path), { recursive: true });
        return true;
    },

    rm(target_path) {
        fs.rmSync(normalize_path(target_path), { recursive: true, force: true });
        return true;
    },

    cp_async(source, destination, callback) {
        try {
            const src = normalize_path(source);
            const dst = normalize_path(destination);
            fs.mkdirSync(path.dirname(dst), { recursive: true });
            fs.copyFileSync(src, dst);
            const size = Number((safe_stat(dst) || {}).size || 0);
            callback(null, {
                current_num_bytes: size,
                bytes_copied: size,
                total_bytes: size
            });
        } catch (error) {
            callback(error);
        }
    },

    mv(source, destination, callback) {
        try {
            const src = normalize_path(source);
            const dst = normalize_path(destination);
            fs.mkdirSync(path.dirname(dst), { recursive: true });
            try {
                fs.renameSync(src, dst);
            } catch (rename_error) {
                if (rename_error && rename_error.code === 'EXDEV') {
                    fs.copyFileSync(src, dst);
                    fs.unlinkSync(src);
                } else {
                    throw rename_error;
                }
            }
            const size = Number((safe_stat(dst) || {}).size || 0);
            callback(null, {
                current_num_bytes: size,
                bytes_copied: size,
                total_bytes: size
            });
        } catch (error) {
            callback(error);
        }
    },

    du(target_path) {
        return du_recursive(target_path);
    },

    disk_stats(target_path) {
        const normalized = normalize_path(target_path);
        const root = path.parse(path.resolve(normalized)).root;
        try {
            const statfs = fs.statfsSync(root);
            const total = Number(statfs.blocks) * Number(statfs.bsize);
            const free = Number(statfs.bfree) * Number(statfs.bsize);
            const used = Math.max(total - free, 0);
            return { total, used, free };
        } catch (error) {
            return { total: 0, used: 0, free: 0 };
        }
    },

    exists(target_path) {
        return fs.existsSync(normalize_path(target_path));
    },

    count(target_path) {
        return count_recursive(target_path);
    },

    find(query, location, options_or_callback, maybe_callback) {
        let options = {};
        let callback = maybe_callback;

        if (typeof options_or_callback === 'function') {
            callback = options_or_callback;
        } else {
            options = options_or_callback || {};
        }

        try {
            const result = find_sync(query, location, options);
            callback(null, result);
        } catch (error) {
            callback(error);
        }
    },

    watch(target_path, callback) {
        const normalized = normalize_path(target_path);

        if (watchers.has(normalized)) {
            watchers.get(normalized).close();
            watchers.delete(normalized);
        }

        const watcher = fs.watch(normalized, { persistent: false }, (event_type, filename) => {
            const full_path = filename ? path.join(normalized, filename.toString()) : normalized;
            let event = 'changed';
            if (event_type === 'rename') {
                event = fs.existsSync(full_path) ? 'created' : 'deleted';
            }
            callback({ event, filename: full_path });
        });

        watchers.set(normalized, watcher);
        return true;
    },

    stop_watch(target_path) {
        const normalized = normalize_path(target_path);
        if (watchers.has(normalized)) {
            watchers.get(normalized).close();
            watchers.delete(normalized);
        }
        return true;
    },

    monitor(callback) {
        return true;
    },

    get_mounts(callback) {
        callback(null, []);
    },

    get_drives(callback) {
        callback(null, []);
    },

    mount(device_name, callback) {
        if (typeof callback === 'function') {
            callback(`Mount is not supported on ${process.platform}`);
        }
    },

    umount(device_name, callback) {
        if (typeof callback === 'function') {
            callback(`Unmount is not supported on ${process.platform}`);
        }
    },

    connect_network_drive(server, username, password, use_ssh_key, type, callback) {
        if (typeof callback === 'function') {
            callback(`Network mount via gio is not supported on ${process.platform}`);
        }
    },

    open_with(target_path) {
        return [];
    },

    set_execute(target_path) {
        return true;
    },

    clear_execute(target_path) {
        return true;
    },

    get_file_icon_data_url(target_path) {
        return null;
    }
};

module.exports = fallback_gio;
