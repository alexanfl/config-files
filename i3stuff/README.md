# Setups steps

* `sudo pacman -S yaourt`
* Install i3, compton, i3blocks, xautolock, urxvt and zsh.
* `cp -r .config/ ~/`
* `cp .Xresources ~/.Xresources && xrdb -merge ~/.Xresources && cp .zshrc ~/.zshrc && cp .zprofile ~/.zprofile`
* Install fonts (http://kumarcode.com/Colorful-i3/)
```
mkdir ~/.local/share/fonts
curl http://kumarcode.com/resources/fontawesome-webfont.ttf --output ~/.local/share/fonts/
curl http://kumarcode.com/resources/AIcons.ttf --output ~/.local/share/fonts/
curl http://kumarcode.com/resources/icons.ttf --output ~/.local/share/fonts/
fc-cache -fv
```
* Install the Ubunto font too from http://font.ubuntu.com/
* `cp -r .vim/* ~/.vim && cp .vimrc ~/.vimrc`
* `sudo mv ~/.config/i3/toggle-lang /usr/bin/ && mv ~/.config/i3/toggle-opac /usr/bin/ && cp lock /usr/bin/` 
* Check network interfaces with `ip link`,
  and change ethernet script and wifi-instance (i3blocks config) 
  in .config/i3blocks.
* Check if i3blocks scripts are located in `/usr/bin` or `/usr/share`, 
  and change `.config/i3blocks/config` accordingly.
* Create an app password for Gmail make the `.em-pw` file.
* `sudo cp toggle-email ~/usr/bin/`

## Install i3blocks' scripts dependencies
* `yaourt -S light-git`
* `yaourt -S acpi`

## Tricks
* Use `sudo wifi-menu` to automatically generate `netctl` config files.
  * NetworkManager might mess things up so should be stopped: `sudo systemctl stop NetworkManager.service`
  * `sudo netctl start <generated config file>`
