## Treasure Map Solver and Mouse Finder ##

for HitGrab's [MouseHunt](https://www.mousehuntgame.com/) browser game.

Based upon code by Chad Moore and [haoala](https://dl.dropboxusercontent.com/u/14589881/map.html)

Using data from [MH Calculator](http://goo.gl/y17T4q)

### Try it ###

You can try it [here on GitHub](http://olf.github.io/mhmapsolver/)

### Build instructions ###

Clone the repository, then do <code>npm install</code>, then <code>gulp release</code>. It will create the release directory that you can either use locally or move to your own server. Mouse data will be fetched from GitHub.

Available gulp tasks:

* gulp (default) - launch dev environment with BrowserSync
* gulp release - update the release/ directory
* gulp sass - generate css file
