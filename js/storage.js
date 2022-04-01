class Storage {
    key = '';
    def = '';

    constructor(args) {

        if(args.key) this.key = args.key;
        if(args.def) this.def = args.def;

        if(!this.value())
            localStorage.setItem(this.key, JSON.stringify(this.def));
    }

    value() {
        return JSON.parse(localStorage.getItem(this.key));
    }

    clear() {
        localStorage.removeItem(this.key);
    }

    save(value) {
        localStorage.setItem(this.key, JSON.stringify(value))
    }
}