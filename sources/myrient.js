const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const axios = require("axios");

const urlCache = {};
const consoles = {
    "Nintendo - Nintendo 64 (BigEndian)": "n64",
    "Nintendo - Nintendo 64 (BigEndian) (Private)": "n64",
    "Nintendo - Nintendo 64 (ByteSwapped)": "n64",
    "Nintendo - Nintendo 64 (ByteSwapped) (Private)": "n64",
    "Nintendo - Nintendo 64 (Mario no Photopi SmartMedia)": "n64",
    "Nintendo - Nintendo 64DD": "n64",

    "Nintendo - Game Boy": "gb",
    "Nintendo - Game Boy (Private)": "gb",
    "Nintendo - Game Boy Color": "gb",
    "Nintendo - Game Boy Color (Private)": "gb",

    "Nintendo - Game Boy Advance": "gba",
    "Nintendo - Game Boy Advance (Multiboot)": "gba",
    "Nintendo - Game Boy Advance (Play-Yan)": "gba",
    "Nintendo - Game Boy Advance (Private)": "gba",
    "Nintendo - Game Boy Advance (Video)": "gba",
    "Nintendo - Game Boy Advance (e-Reader)": "gba",

    "Nintendo - Nintendo DS (DSvision SD cards)": "nds",
    "Nintendo - Nintendo DS (Decrypted)": "nds",
    "Nintendo - Nintendo DS (Decrypted) (Private)": "nds",
    "Nintendo - Nintendo DS (Download Play)": "nds",
    "Nintendo - Nintendo DS (Encrypted)": "nds",
    
    "Nintendo - Nintendo Entertainment System (Headered)": "nes",
    "Nintendo - Nintendo Entertainment System (Headered) (Private)": "nes",
    "Nintendo - Nintendo Entertainment System (Headerless)": "nes",
    "Nintendo - Nintendo Entertainment System (Headerless) (Private)": "nes",

    "Nintendo - Super Nintendo Entertainment System": "snes",
    "Nintendo - Super Nintendo Entertainment System (Private)": "snes",

    "Non-Redump - Sony - PlayStation": "psx",

    "Non-Redump - Sony - PlayStation 2": "ps2",

    "Nintendo - Virtual Boy": "vb",
    "Nintendo - Virtual Boy (Private)": "vb",

    "Sega - Mega Drive - Genesis": "segaMD",
    "Sega - Mega Drive - Genesis (Private)": "segaMD",

    "Sega - Master System - Mark III": "segaMS",

    "Atari - Lynx (BLL)": "lynx",
    "Atari - Lynx (LNX)": "lynx",
    "Atari - Lynx (LYX)": "lynx",
    "Atari - Lynx (LYX) (Private)": "lynx",

    "Sega - 32X": "sega32x",

    "Atari - Jaguar (ABS)": "jaguar",
    "Atari - Jaguar (COF)": "jaguar",
    "Atari - Jaguar (J64)": "jaguar",
    "Atari - Jaguar (JAG)": "jaguar",
    "Atari - Jaguar (ROM)": "jaguar",

    "Sega - Game Gear": "segaGG",

    "Non-Redump - Sega - Sega Saturn": "segaSaturn",

    "Atari - 7800": "atari7800",
    "Atari - 7800 (Private)": "atari7800",

    "Atari - 2600": "atari2600",

    "NEC - PC Engine - TurboGrafx-16": "pce",
    "NEC - PC Engine - TurboGrafx-16 (Private)": "pce",
    "Non-Redump - NEC - PC Engine CD + TurboGrafx CD": "pce",

    "SNK - NeoGeo Pocket": "ngp",
    "SNK - NeoGeo Pocket Color": "ngp",

    "Bandai - WonderSwan": "ws",
    "Bandai - WonderSwan Color": "ws",

    "Coleco - ColecoVision": "coleco",

    "Commodore - Commodore 64": "c64",
    "Commodore - Commodore 64 (PP)": "c64",
    "Commodore - Commodore 64 (Tapes)": "c64",

    "Non-Redump - Sony - PlayStation Portable": "psp",
    "Sony - PlayStation Portable (PSN) (Encrypted)": "psp",
    "Unofficial - Sony - PlayStation Portable (PSN) (Decrypted)": "psp",
    "Unofficial - Sony - PlayStation Portable (PSX2PSP)": "psp",
    "Unofficial - Sony - PlayStation Portable (UMD Music)": "psp",
    "Unofficial - Sony - PlayStation Portable (UMD Video)": "psp",
};

class Myrient {
    constructor() {
        this.url = 'https://myrient.erista.me/files/No-Intro/';
    };

    async scrape(url = this.url) {
        const axiosResponse = await axios.request({
            method: "GET",
            url: url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
            }
        });

        console.log("SCRAPING: " + url);

        const dom = new JSDOM(axiosResponse.data, { runScripts: "dangerously" });

        const fileElements = dom.window.document.querySelectorAll('#list > tbody > tr');

        var returnedJson = [];

        for await (const fileElement of fileElements) {
            if ( fileElement.querySelector(".link > a").getAttribute("title") == null) continue;

            var link = url + fileElement.querySelector(".link > a").href;

            var name = fileElement.querySelector(".link > a").getAttribute("title");
            var size = fileElement.querySelector(".size").innerHTML;
            //var date = fileElement.querySelector(".date").innerHTML;
            var isdir = link.endsWith("/");
            var children = [];

            console.log("FILE: " + name);

            if ( isdir == true && Object.keys(consoles).includes(name) == false ) continue;

            if ( isdir == true ) {
                children = await this.scrape(link);
            } else if ( isdir == false ) {
                var arrayUrl = String(new URL(link).pathname).split("/");
                arrayUrl.pop();
                var finalUrl = arrayUrl.join("/")
                if ( urlCache[finalUrl] ) {
                    link = link.replace("myrient.erista.me", urlCache[finalUrl]);
                } else {
                    var fetchReq = await fetch(link, {
                        "headers": {
                            "cache-control": "no-cache",
                            "pragma": "no-cache",
                        },
                        "body": null,
                        "method": "HEAD"
                    })
                        .catch(error => {
                            console.log("Couldn't get game download url :(");
                            console.log(error)
                        });
                    if ( fetchReq.url != undefined ) {
                        link = fetchReq.url;
                        urlCache[finalUrl] = new URL(link).host;
                        console.log(urlCache)
                        //urlCache[url] = fetchReq.url.slice(0, -(fileElement.querySelector(".link > a").href.length))
                    };

                    console.log(link);
                    //link = link.replace("myrient.erista.me", "download6.mtcontent.rs");
                };
            };
            //l: new URL(link).pathname.substring(6 + 10),
            returnedJson.push({
                e: Object.keys(consoles).includes(name) ? consoles[name] : null,
                l: new URL(link).pathname.substring(6 + 10),
                h: new URL(link).host,
                n: name,
                s: size,
                //date,
                d: isdir,
                c: children
            });
        };

        return returnedJson;
    };
};

module.exports = Myrient;