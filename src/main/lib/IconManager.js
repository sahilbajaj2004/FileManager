const fs = require('fs');
const path = require('path');

class IconManager {

    constructor() {
        this.home = require('os').homedir();
        this.icon_theme = 'default';
        this.theme_root = path.join(process.cwd(), 'src', 'assets', 'icons');
        this.theme_path = this.get_theme_path();
    }

    get_symlink_icon() {

        try {

            let icon_path = path.join(this.theme_path, 'emblem-symbolic-link.svg');
            if (!fs.existsSync(icon_path)) {
                icon_path = path.join(process.cwd(), 'src', 'assets', 'icons', 'emblem-symbolic-link.svg');
            }

            return icon_path;

        } catch (err) {

            console.error('Error in symlink_icon:', err);
            return path.join(__dirname, 'assets/icons/emblem-symbolic-link.svg');

        }

    }

    get_readonly_icon() {

        try {

            let icon_path = path.join(this.theme_path, 'emblem-readonly.svg');
            if (!fs.existsSync(icon_path)) {
                icon_path = path.join(process.cwd(), 'src', 'assets', 'icons', 'emblem-readonly.svg');
            }

            return icon_path;

        } catch (err) {
            console.log(err);
        }
    }

    get_theme_path() {

        let icon_dir = this.theme_root || path.join(__dirname, 'assets', 'icons');
        let theme_path = '';

        try {
            if (!icon_dir || !fs.existsSync(icon_dir)) {
                icon_dir = path.join(__dirname, 'assets', 'icons', 'kora');
            }

            const icon_dirs = [
                'scalable/places/',
                'places@2x/48/',
                '32x32/places/',
                '64x64/places/',
                'places/scalable/',
                'scalable@2x/places/',
                'places/32/',
                'places/48/',
                'places/64/',
                'places/128/',
                'places/symbolic/',
                'scalable/'
            ].map(dir => path.join(icon_dir, dir));

            // Find the first existing icon directory
            theme_path = icon_dirs.find(dir => fs.existsSync(dir));

            // If no theme path found, use the fallback
            if (!theme_path) {
                theme_path = path.join(__dirname, 'assets/icons/');
            }

            return theme_path;

        } catch (error) {
            console.error('Error in getIconThemePath:', error);
            return path.join(__dirname, 'assets/icons/');
        }
    }

    // Apply icon sizing to media elements
    apply_icon_size_to_media(element, view_type) {
        if (!element) return;
        // Sizing is handled via CSS classes; this is a hook for future use.
    }

    // get folder icon
    get_folder_icon(e, href) {

        try {

            const baseName = path.basename(href);

            const specialFolders = {
                'Documents': ['folder-documents', 'folder-document'],
                'Music': ['folder-music'],
                'Pictures': ['folder-pictures', 'folder-image'],
                'Videos': ['folder-videos', 'folder-video'],
                'Downloads': ['folder-downloads', 'folder-download'],
                'Desktop': ['folder-desktop']
            };

            const folderType = specialFolders[baseName] || ['folder', 'default-folder'];
            const extensions = ['.svg', '.png'];

            // Try to find a special folder icon first
            let final_icon = null;
            for (const type of folderType) {
                for (const ext of extensions) {
                    const iconPath = path.join(this.theme_path, `${type}${ext}`);
                    if (fs.existsSync(iconPath)) {
                        final_icon = iconPath;
                        break;
                    }
                }
                if (final_icon) break;
            }

            // If no special icon found, fall back to generic folder icons
            if (!final_icon) {
                const folder_icons = [
                    'folder.svg',
                    'folder.png',
                    'default-folder.svg',
                    'default-folder.png'
                ];

                final_icon = folder_icons.reduce((found, icon) => {
                    if (found) return found;
                    const icon_path = path.join(this.theme_path, icon);
                    return fs.existsSync(icon_path) ? icon_path : null;
                }, null);
            }

            // If still no icon found, use the ultimate fallback
            final_icon = final_icon || path.join(process.cwd(), 'src', 'assets', 'icons', 'folder.svg');

            return final_icon;

        } catch (err) {
            console.error('Error in folder icon selection:', err);
            return path.join(__dirname, '../assets/icons/folder.svg');
        }

    }

}

module.exports = new IconManager();