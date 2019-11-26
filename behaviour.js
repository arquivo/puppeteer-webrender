async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight > 4000) {
                    clearInterval(timer);
                    // Scroll back to the top:
                    window.scrollTo(0, 0);
                    resolve();
                }
            }, 200);
        });
    });
}

module.exports = {
    autoScroll: autoScroll
};