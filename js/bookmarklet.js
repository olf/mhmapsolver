javascript:void(function(){
    var u = "http://localhost:3000/";
    var l = document.querySelectorAll('.treasureMapPopup-mice-groups.uncaughtmice .treasureMapPopup-mice-group-mouse-name span');
    var m = "";
    for (i=0; i<l.length;i++) {
        m += l[i].textContent.replace(" ", "+") + (i==l.length-1 ? '' : '/');
    }
    if (l.length > 0) {
        window.open(u + "?mice=" + m,'_blank');
    }
})()
