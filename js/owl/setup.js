$('.owl-carousel').owlCarousel({
    loop:true,
    margin:10,
    nav:false,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:3
        },
        1000:{
            items:5
        }
    }
})

function bigImg(x) {
    x.style.height = "125%";
    x.style.width = "125%";
}

function normalImg(x) {
    x.style.height = "100%";
    x.style.width = "100%";
}