export const loadCompendia = async function (compendia) {
    return await Promise.all(compendia.map((c) => {return loadCompendium(c);}));
}

const possessions = ["Clothing","Tools","Weapons","Printed Matter","Odds and Ends"];

async function loadCompendium (compendium) {
    // const folderName = (possessions.includes(compendium)) ? `Possession/${compendium}`: compendium;
    const folderName = compendium;
    const folder = game.folders.find(f => f.name === folderName);
    const packname = "dee." + compendium.toLowerCase().replace(/ /g,"-");
    const pack = game.packs.get(packname);
    if (pack) {
        if (folder) {
            let loaded = await folder.getFlag("dee","loaded");
            if (loaded===true) {
                return Promise.resolve(`${compendium} pack already imported`);
            }
            let imp = await pack.importAll({folderId:folder.id});
            folder.setFlag("dee","loaded",true);
            return imp;
        } else {
            let imp = await pack.importAll({folderName:folderName});
            let newFolder = game.folders.find(f => f.name === folderName);
            if (newFolder) {
                newFolder.setFlag("dee","loaded",true);
            } else {
                console.log(`Couldn't find new folder ${folderName} for ${compendium}`);
            }
            return imp;
        }
    } else {
        return Promise.resolve(`Couldn't find ${packname} pack to import for ${compendium}`);
    }
}
