//this makes the current link containing li of class "active"
$(document).ready(function ($) {
    var url = window.location.href;
    var activePage = url;
    $('.irp-menu-item a').each(function () {
        var linkPage = this.href;

        if (activePage == linkPage) {
            $(this).closest("li").addClass("active");
        }
    });
});