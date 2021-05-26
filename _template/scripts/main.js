function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min - 1)) + min + 1;
};

function getRandomVal(values) {
    const array = Array.from(values);
    return array[getRandomInt(0, array.length - 1)];
};

const vueApp = Vue.createApp({
    data: () => ({
        screen: "",
        type: "none",
        options: {},
        time: 5,
        score: 0,
        count: 0,
    }),
    complete: {
        hash: {
            get: () => location.hash.slice(1),
            set: (newValue) => location.hash = newValue,
        },
    },
    methods: {
        async startCarNumberShowScreen() {
            const L = "АВЕКМНОРСТУХ";
            const number = (getRandomVal(L) + getRandomInt(100, 999) +
                getRandomVal(L) + getRandomVal(L) + " " + getRandomInt(1, 999));
            this.options.number = number;
            this.time = 5;
            this.screen = "car-number-show";
            while (this.time) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.time -= 1;
            };
            this.screen = "none";
            this.options = {};
            return number;
        },
        async startCarNumberGuessScreen() {
            this.screen = "car-number-guess";
            await new Promise(resolve => this.$refs.btn.onclick = resolve);
            const answer = this.options.answer.toUpperCase();
            this.screen = "none";
            this.options = {};
            return answer;
        },
    },
    created() {
        window.addEventListener("hashchange", () => {
            this.hash = location.hash;
        });
    },
}).mount("#app");
