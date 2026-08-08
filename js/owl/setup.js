window.iniciarOwl = function (selector) {
    const $el = $(selector);
    if (!$el || !$el.hasClass('owl-carousel')) return;
    if ($el.data('owl.carousel')) {
        $el.trigger('destroy.owl.carousel');
    }
    $el.owlCarousel({
        loop: true,
        margin: 10,
        nav: false,
        responsive: {
            0: { items: 1 },
            600: { items: 3 },
            1000: { items: 5 },
        },
    });
};

function bigImg(x) {
    x.style.height = '125%';
    x.style.width = '125%';
}

function normalImg(x) {
    x.style.height = '100%';
    x.style.width = '100%';
}
