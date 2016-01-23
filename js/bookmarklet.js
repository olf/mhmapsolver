javascript:void(function(){
    var url = "http://olf.github.io/mhmapsolver/";
    var list = document.querySelectorAll('.treasureMapPopup-mice-groups.uncaughtmice .treasureMapPopup-mice-group-mouse-name span');
    var mice = [];

    for (i=0; i<list.length; i++) {
        mice.push(list[i].textContent.split(" ").join("+"));
    }

    if (mice.length > 0) {
        window.open(url + "?mice=" + mice.join("/"), 'mhmapsolver');
    }
})()
