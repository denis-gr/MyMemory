const ANIMAL_SYMBOLS = "🐒🦍🦧🐕🦮🐕‍🐩🐺🦊🦝🐈🐈‍⬛🦁🐅🐆🐎🦄🦓🦌🦬🐂🐃🐄🐖🐗🐏🐑🐐🐪🦙🦒🐘🦣🦏🦛🐁🐹🐇🐿🦫🦔🦇🐻🐻‍❄️🐨🐼🦥🦦🦨🦘🦡🦃🐔🐓🐤🐦🐧🕊🦅🦆🦢🦉🦤🦩🦚🦜🐸🐊🐢🦎🐍🐉🦕🦖🐳🐬🦭🐟🐠🐡🦈🐙🐌🦋🐛🐜🐝🪲🐞🦗🪳🕷🦂🦟🪰🪱";

const DEFAILT_SETTINGS = {
    "CarNumber": {
        name: "CarNumber",
        title: "Автономильный номер",
        description: "Запомните, а потом вспомните, автомобильный номер в формате России",
        timeShow: 7,
        countRound: 5,
        maxCost: 2,
    },
    "PhoneNumber": {
        name: "PhoneNumber",
        title: "Телефоный номер",
        description: "Запомните, а потом вспомните, телефоный номер в международном формате (РФ)",
        timeShow: 7,
        countRound: 5,
        maxCost: 2,
    },
    "Paragraph": {
        name: "Paragraph",
        title: "Параграф",
        description: "Запомните, а потом вспомните, фрагмент текста",
        timeShow: 70,
        countRound: 5,
        max: 200,
        min: 100,
        maxCost: 5,
    },
    $: {
        countRound: 10,
        games: ["CarNumber", "PhoneNumber", "Paragraph"],
    },
};

const CACHE = {};

function levenshtein(s1, s2, costs={}) {
    var i, j, flip, ch, chl, ii, ii2, cost, cutHalf;
    const l1 = s1.length;
    const l2 = s2.length;
    const cr = costs.replace || 1;
    const cri = costs.replaceCase || costs.replace || 1;
    const ci = costs.insert || 1;
    const cd = costs.remove || 1;

    cutHalf = flip = Math.max(l1, l2);

    var minCost = Math.min(cd, ci, cr);
    var minD = Math.max(minCost, (l1 - l2) * cd);
    var minI = Math.max(minCost, (l2 - l1) * ci);
    var buf = new Array((cutHalf * 2) - 1);

    for (i = 0; i <= l2; ++i) {
        buf[i] = i * minD;
    };

    for (i = 0; i < l1; ++i, flip = cutHalf - flip) {
        ch = s1[i];
        chl = ch.toLowerCase();

        buf[flip] = (i + 1) * minI;

        ii = flip;
        ii2 = cutHalf - flip;

        for (j = 0; j < l2; ++j, ++ii, ++ii2) {
            cost = (ch === s2[j] ? 0 : (chl === s2[j].toLowerCase()) ? cri : cr);
            buf[ii + 1] = Math.min(buf[ii2 + 1] + cd, buf[ii] + ci, buf[ii2] + cost);
        };
    };
    return buf[l2 + cutHalf - flip];
};

function getCost(str1, str2, maxCost) {
    const max = str1.length > str2.length ? str1 : str2;
    const min = str1.length < str2.length ? str1 : str2;
    return Math.floor((1 - levenshtein(max, min) / max.length) * maxCost);
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

async function getRandomParagraphFromBook(lang, min, max) {
    if (!CACHE.books) {
        CACHE.books = await fetch("{{ start_url }}/data/books.json");
        CACHE.books = (await CACHE.books.json()).books;
    };
    const b = getRandomVal(CACHE.books.filter(i=> !lang || i.lang == lang));
    let p = b.text.split("\n").filter(i => i.length > min && i.length < max);
    p = getRandomVal(p);
    return {name: b.name, text: p};
};

async function getRandomName(lang="ru") {
    if (!CACHE.names) {
        CACHE.names = await fetch("{{ start_url }}/data/names.json");
        CACHE.names = (await CACHE.names.json()).names;
    };
    const names = (CACHE.names[lang].man + CACHE.names[lang].woman).split(" ");
    return getRandomVal(names);
};

const vueApp = Vue.createApp({
    data: () => ({
        settings: DEFAILT_SETTINGS,
        screen: "none",
        time: 5,
        score: 0,
        count: 0,
    }),
    methods: {
        async startCarNumberShowScreen() {
            const L = "ABEKMHOPCTYX";
            let number = getRandomVal(L) + getRandomInt(100, 999);
            number += getRandomVal(L) + getRandomVal(L) + " " + getRandomInt(1, 999);
            this.$refs["car-number-number"].textContent = number;
            this.time = DEFAILT_SETTINGS.CarNumber.timeShow;
            this.screen = "carNumberShow";
            while (this.time) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.time -= 1;
            };
            this.screen = "none";
            number = number.replaceAll(/\s*/g, "").toUpperCase();
            number = replaceSimilarLetters(number);
            return number;
        },
        async startCarNumberGuessScreen() {
            this.screen = "carNumberGuess";
            setTimeout(() => this.$refs["car-number-input"].focus(), 500);
            await new Promise(r => this.$refs["car-number-btn"].onclick = r);
            let answer = this.$refs["car-number-input"].value || "";
            this.$refs["car-number-input"].value = "";
            answer = answer.replaceAll(/\s*/g, "").toUpperCase();
            answer = replaceSimilarLetters(answer);
            this.screen = "none";
            return answer;
        },
        async startPhoneNumberShowScreen() {
            const number = "+7" + getRandomInt(1_000_000_000, 9_999_999_999);
            this.$refs["phone-number-number"].textContent = number;
            this.time = DEFAILT_SETTINGS.PhoneNumber.timeShow;
            this.screen = "phoneNumberShow";
            while (this.time) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.time -= 1;
            };
            this.screen = "none";
            return number.replaceAll("+7", "");
        },
        async startPhoneNumberGuessScreen() {
            this.screen = "phoneNumberGuess";
            setTimeout(() => this.$refs["phone-number-input"].focus(), 500);
            await new Promise(r => this.$refs["phone-number-btn"].onclick = r);
            const answer = this.$refs["phone-number-input"].value || "";
            this.$refs["phone-number-input"].value = "";
            this.screen = "none";
            return answer.replaceAll("+7", "");
        },
        async startParagraphShowScreen() {
            const s = this.settings.Paragraph;
            const temp = await getRandomParagraphFromBook(null, s.min, s.max);
            this.$refs["paragraph-text"].textContent = temp.text;
            this.$refs["paragraph-name"].textContent = temp.name;
            this.time = s.timeShow;
            this.screen = "paragraphShow";
            while (this.time) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.time -= 1;
            };
            this.screen = "none";
            return temp.text;
        },
        async startParagraphGuessScreen() {
            this.screen = "paragraphGuess";
            setTimeout(() => this.$refs["paragraph-input"].focus(), 500);
            await new Promise(r => this.$refs["paragraph-btn"].onclick = r);
            const answer = this.$refs["paragraph-input"].value || "";
            this.$refs["paragraph-input"].value = "";
            this.screen = "none";
            return answer;
        },
        async startPlainGame(nameGame) {
            const settings = DEFAILT_SETTINGS[nameGame];
            for (let i = 0; i < settings.countRound; i++) {
                let temp = await this[`start${nameGame}ShowScreen`]();
                let temp2 = await this[`start${nameGame}GuessScreen`]();
                this.score += getCost(temp, temp2, settings.maxCost);
                this.count += settings.maxCost;
            };
            this.screen = "gameEnd";
        },
        async startMultiGame() {
            for (let i = 0; i < DEFAILT_SETTINGS.$.countRound; i++) {
                let game = getRandomVal(DEFAILT_SETTINGS.$.games);
                let t = await this[`start${game}ShowScreen`]();
                let t2 = await this[`start${game}GuessScreen`]();
                this.count += DEFAILT_SETTINGS[game].maxCost;
                this.score += getCost(t, t2, DEFAILT_SETTINGS[game].maxCost);
            };
            this.screen = "gameEnd";
        },
    },
    computed: {
        games(vm) {
            const games = Object.assign({}, vm.settings);
            delete games["$"];
            return games;
        },
    },
    mounted() {
        document.querySelectorAll(".form").forEach(el => {
            el.addEventListener("keydown", event =>
                event.keyCode == 13 ? el.querySelector(".btn").click() : 0
            );
        });
    },
}).mount("#app");
