import { Logger } from "./logger.js";

const log = new Logger();

const mannerisms = {
    "Phlegm": [
        "Easy going attitude",
        "Quietly stubborn",
        "Doesn’t want to be any trouble",
        "Avoid conflict",
        "Open to all the options",
        "Passive listener (I am listening!)",
        "Can’t we all just get along?",
        "Unevenly apportions work",
        "Watches others",
        "Avoids making decisions",
        "Always looking for the exits",
        "Easily amused"
    ],
    "Black Bile": [
        "Reserved",
        "Generally looks sad or upset",
        "It’s safer not to go alone",
        "Schedule orientated",
        "Hears negatives",
        "Avoids criticism",
        "Incredibly organised",
        "Difficult to please",
        "Suspicious",
        "Always with a flourish",
        "It’s always better to music",
        "Thrifty"
    ],
    "Yellow Bile": [
        "Eager to find out more",
        "Unreasonably ambitious",
        "Insistent (go on, go on…)",
        "Trustworthy",
        "Louder is better",
        "Always prepared",
        "Knows everything",
        "Unrepentent",
        "Self-sufficient (but not prepared)",
        "Not tired (but tired)",
        "Throws things, just to cope",
        "Unnecessarily competitive"
    ],
    "Blood": [
        "Disorganised",
        "Short attention span",
        "Wealthy in my friends",
        "Sudden emotional pendulum",
        "Credit where credit’s due",
        "Wants to please",
        "Unintentionally forgetful",
        "Open to being led astray",
        "Generally full of cheer",
        "Have gossip, will gossip",
        "Mildly immature",
        "Always tries to bounce back"
    ]
}

const homes = [
    "London",
    "Norwich",
    "Cambridge",
    "Newcastle",
    "Coventry",
    "Exeter",
    "Salisbury",
    "Ipswich",
    "King's Lynn",
    "Canterbury",
    "Totnes",
    "Reading",
    "Colchester",
    "Lavenham",
    "Wisbech",
    "Bury St Edmunds",
    "Hull",
    "York",
    "Worcester",
    "Lincoln",
    "Hereford",
    "Gloucester",
    "Leicester",
    "Hadleigh",
    "Great Yarmouth",
    "Dover",
    "Oxford",
    "Southampton",
    "Bolton",
    "Bristol",
    "Wrexham",
    "Carmarthen",
    "Brecon",
    "Dublin",
    "Drogheda",
    "Waterford"
]

const christian = {
    male: [
        "John",
        "Thomas",
        "William",
        "Robert",
        "Richard",
        "Henry",
        "George",
        "Edward",
        "James",
        "Francis",
        "Nicholas",
        "Ralph",
        "Christopher",
        "Anthony",
        "Matthew",
        "Edmund",
        "Walter",
        "Hugh",
        "Andrew",
        "Humphrey",
        "Abraham",
        "Barnaby",
        "Valentine",
        "Leonard",
        "Martin",
        "Simon",
        "Peter",
        "Philip",
        "Stephen",
        "Lawrence",
        "Roger",
        "Daniel",
        "Michael",
        "Samuel",
        "Allen",
        "Charles",
        "Alexander",
        "Gregory",
        "Nathaniel",
        "David",
        "Luke",
        "Tobias",
        "Isaac",
        "Ambrose",
        "Griffin",
        "Squally",
    ],
    female: [
        "Elizabeth",
        "Joan",
        "Margaret",
        "Alice",
        "Anne",
        "Mary",
        "Jane",
        "Catherine",
        "Elinor",
        "Isabel",
        "Dorothy",
        "Margery",
        "Susanna",
        "Ellen",
        "Sarah",
        "Frances",
        "Joyce",
        "Ruth",
        "Constance",
        "Amphelisia",
        "Kynborow",
        "Clarice",
        "Christina",
        "Edith",
        "Emma",
        "Lucy",
        "Marion",
        "Cecily",
        "Grace",
        "Amy",
        "Rachel",
        "Charity",
        "Rose",
        "Fortune",
        "Judith",
        "Philippa",
        "Audrey",
        "Janet",
        "Sybil",
        "Beatrice",
        "Maria",
        "Blanche",
        "Lettice",
        "Faith",
        "CharityAgnes",
    ]
}

const surnames = [
    "Abell",
    "Abery",
    "Adams",
    "Alington",
    "Ashton",
    "Askew",
    "Aubrey",
    "Aylmer",
    "Bacon",
    "Bailey",
    "Ballard",
    "Bands",
    "Barfoot",
    "Barton",
    "Berry",
    "Bewley",
    "Boothe",
    "Borrow",
    "Bray",
    "Carter",
    "Cavell",
    "Cely",
    "Chase",
    "Chatwyn",
    "Cheddar",
    "Chester",
    "Child",
    "Clark",
    "Cole",
    "Conquest",
    "Daunce",
    "Dickinson",
    "Duff",
    "Egerton",
    "Estney",
    "Fitzlewis",
    "Fletcher",
    "Fox",
    "Froste",
    "Gage",
    "Geffray",
    "Godfrey",
    "Goldwell",
    "Gomfrey",
    "Goodryke",
    "Gorste",
    "Grimbald",
    "Haddock",
    "Harte",
    "Harwood",
    "Hatteclyff",
    "Hodgeson",
    "Hornebolt",
    "Hylderley",
    "Irving",
    "Killigrew",
    "Knoyll",
    "Lake",
    "Leeds",
    "Lloyd",
    "Lodyngton",
    "Lond",
    "Loveryk",
    "Lyon",
    "Lytton",
    "Mede",
    "Merstun",
    "Milner",
    "Molyngton",
    "Morecote",
    "Mugge",
    "Nash",
    "Oke",
    "Page",
    "Petley",
    "Pyn",
    "Roper",
    "Sandes",
    "Scrogs",
    "Shawe",
    "Shevington",
    "Snell",
    "Sparrow",
    "Stokerton",
    "Sumner",
    "Treningham",
    "Ufford",
    "Vawdrey",
    "Warde",
    "Winter",
    "Wyard",
    "Yaxley",
]

export function generator(type) {
    switch (type) {
        case "manner-roll":
            const humours = Object.keys(mannerisms);
            const humour = humours[Math.floor(Math.random() * humours.length)];
            const manner = mannerisms[humour][Math.floor((Math.random() * humour.length))];
            return {data:{mannerism: {humour:humour,detail:manner}}};
        case "home-roll":
            const home = homes[Math.floor(Math.random() * homes.length)];
            return {data:{home: home}};
        case "name-roll":
            const sex = (Math.random()>0.5) ? "male" : "female";
            const forename = christian[sex][Math.floor(Math.random() * christian[sex].length)];
            const surname = surnames[Math.floor(Math.random() * surnames.length)];
            return {name:`${forename} ${surname}`};
    }
}

export async function randomPossessions(actor, html) {
    const checks = $(html).find('input[name="possessions"]:checked');
    if (checks.length > 3) {
        ui.notifications.warn("You must choose three or less!");
        return false;
    }
    const types = [];
    checks.map(function() {
        types.push($(this).val());
    });
    const items = [];
    await Promise.all(types.map(async(type) => {
        const folder = game.folders.getName(type);
        if (folder) {
            const rt = await RollTable.fromFolder(folder,{temporary:true,renderSheet:false});
            const roll = await rt.roll({async:true});
            const res = roll.results[0].data;
            const item = game.items.getName(res.text);
            if (item) {
                items.push(item.toObject());
            }
        }
        return Promise.resolve(true);
    }));
    if (items.length) {
        return await actor.createEmbeddedDocuments("Item",items);
    }
}

export async function randomThing(actor, type) {
    const folder = game.folders.getName(type);
    if (folder) {
        const rt = await RollTable.fromFolder(folder,{temporary:true,renderSheet:false});
        const roll = await rt.roll({async:true});
        const res = roll.results[0].data;
        const item = game.items.getName(res.text);
        if (item) {
            return await actor.createEmbeddedDocuments("Item",[item.toObject()]);
        }
    }
}

export async function randomFavourOrSight(actor) {
    const useSight = game.settings.get("dee", "use-sight");
    if (useSight) {
        log.debug('randomFavourOrSight() | Using The Sight Rules');
        const hasSight = Math.round(Math.random() * 11) + 1  >= 11;
        return (hasSight) ? randomThing(actor,  "Sights") : randomThing(actor,  "Favours");
    }
    return randomThing(actor,  "Favours"); 
}