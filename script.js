const slideshow = document.querySelector('slideshow');
const debug = slideshow.classList.contains('debug');

function scrollToNext() {
    let endpoint = slideshow.scrollLeft + slideshow.clientWidth;

    slideshow.classList.add('transitioning');
    const transitionListener = () => {
        slideshow.scrollBy({
            left: slideshow.clientWidth,
            behavior: 'smooth'
        });
        [...slideshow.children][0].removeEventListener('transitionend', transitionListener);
    };
    setTimeout(() => {
        [...slideshow.children][0].addEventListener('transitionend', transitionListener);
    }, 5);

    return new Promise(resolve => {
        const scrollHandler = () => {
            let delta = Math.abs(endpoint - slideshow.scrollLeft);
            if (true || debug) {
                console.log(endpoint, slideshow.scrollLeft, delta);
            }
            if (delta <= 10) {
                slideshow.removeEventListener('scroll', scrollHandler);
                slideshow.classList.remove('transitioning');
                resolve();
            }
        }
        slideshow.addEventListener('scroll', scrollHandler);
    });
};

if (debug) {
    document.body.addEventListener('keydown', e => {
        if (e.key == 'ArrowRight') {
            scrollToNext();
        }
    })
}

[...document.querySelector('slideshow').children].forEach((div, i) => {
    const canvas = div.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    if (debug) {
        div.querySelector('img').onload = () => {
            canvas.width = div.clientWidth;
            canvas.height = div.clientHeight;
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.rect(
                div.dataset.x * canvas.width / 100,
                div.dataset.y * canvas.height / 100,
                div.dataset.w * canvas.width / 100,
                div.dataset.h * canvas.width / 100
            );
            ctx.stroke();
        };
    }
    const canvasClick = e => {
        const boundingRect = canvas.getBoundingClientRect();
        canvas.width = div.clientWidth;
        canvas.height = div.clientHeight;
        const clickPercentages = {
            x: (e.clientX - boundingRect.x) / canvas.width,
            y: (e.clientY - boundingRect.y) / canvas.height
        };
        const bounds = {
            x: [parseInt(div.dataset.x) / 100, (parseInt(div.dataset.x) + parseInt(div.dataset.w)) / 100],
            y: [parseInt(div.dataset.y) / 100, (parseInt(div.dataset.y) + parseInt(div.dataset.h)) / 100]
        };
        let insideBox = (
            (clickPercentages.x > bounds.x[0] && clickPercentages.x < bounds.x[1])
            &&
            (clickPercentages.y > bounds.y[0] && clickPercentages.y < bounds.y[1])
        );
        console.log(`Clicked ${insideBox ?
            'inside' : 'outside'
            } the box.`);
        if (insideBox && !debug) {
            canvas.removeEventListener('click', canvasClick);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.clearRect(
                div.dataset.x * canvas.width / 100,
                div.dataset.y * canvas.height / 100,
                div.dataset.w * canvas.width / 100,
                div.dataset.h * canvas.width / 100
            );
            canvas.classList.add('dark');
            const transitionListener = () => {
                console.log('Transition completed');
                if (div.parentElement.lastElementChild != div) {
                    scrollToNext();
                }
                canvas.removeEventListener('transitionend', transitionListener);
            };
            canvas.addEventListener('transitionend', transitionListener);
        } else if (debug) {
            ctx.strokeStyle = '#FF0000';
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.rect(
                div.dataset.x * canvas.width / 100,
                div.dataset.y * canvas.height / 100,
                div.dataset.w * canvas.width / 100,
                div.dataset.h * canvas.width / 100
            );
            ctx.stroke();
        }
    };
    canvas.addEventListener('click', canvasClick);
});
