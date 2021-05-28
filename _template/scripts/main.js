DEFAILT_SETTINGS = {
    "CarNumber": {
        timeShow: 7,
        countRound: 5,
    },
    "MultiGame": {
        countRound: 10,
        games: ["CarNumber"],
    },
    games: [{
        name: "CarNumber",
        title: "Автономильный номер",
        description: "Запомните, а потом вспомните, автоноьильный номер в формате России",
    }],
};

function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min - 1)) + min + 1;
};

function getRandomVal(values) {
    const array = Array.from(values);
    return array[getRandomInt(0, array.length - 1)];
};

function replaceSimilarLetters(str) {
    const E = "ABEKMHOPCTYX";
    const R = "АВЕКМНОРСТУХ";
    return str.replaceAll(new RegExp(`[${R}]`, "g"), o => E[R.indexOf(o)]);
};

const vueApp = Vue.createApp({
    data: () => ({
        settings: DEFAILT_SETTINGS,
        screen: "none",
        options: {},
        time: 5,
        score: 0,
        count: 0,
    }),
    methods: {
        async startCarNumberShowScreen() {
            const L = "ABEKMHOPCTYX";
            let number = getRandomVal(L) + getRandomInt(100, 999);
            number += getRandomVal(L) + getRandomVal(L) + " " + getRandomInt(1, 999);
            this.options.number = number;
            this.time = DEFAILT_SETTINGS.CarNumber.timeShow;
            this.screen = "carNumberShow";
            while (this.time) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.time -= 1;
            };
            this.screen = "none";
            this.options = {};
            number = number.replaceAll(/\s*/g, "").toUpperCase();
            number = replaceSimilarLetters(number);
            return number;
        },
        async startCarNumberGuessScreen() {
            this.screen = "carNumberGuess";
            setTimeout(() => this.$refs.input.focus(), 500);
            await new Promise(resolve => this.$refs.btn.onclick = resolve);
            let answer = this.options.answer || "";
            answer = answer.replaceAll(/\s*/g, "").toUpperCase();
            answer = replaceSimilarLetters(answer);
            this.screen = "none";
            this.options = {};
            return answer;
        },
        async startPlainGame(nameGame) {
            for (let i = 0; i < DEFAILT_SETTINGS[nameGame].countRound; i++) {
                let temp = await this[`start${nameGame}ShowScreen`]();
                let temp2 = await this[`start${nameGame}GuessScreen`]();
                this.score += temp == temp2 ? 1 : 0;
                this.count += 1;
            };
            this.screen = "gameEnd";
        },
        async startMultiGame() {
            for (let i = 0; i < DEFAILT_SETTINGS.MultiGame.countRound; i++) {
                let game = getRandomVal(DEFAILT_SETTINGS.MultiGame.games);
                let temp = await this[`start${game}ShowScreen`]();
                let temp2 = await this[`start${game}GuessScreen`]();
                this.count += 1;
                this.score += temp == temp2 ? 1 : 0;
            };
        },
    },
    async created() {},
    async mounted() {
        this.$refs.form.addEventListener("keydown", event =>
            event.keyCode == 13 ? this.$refs.btn.click() : 0
        );
    },
}).mount("#app");