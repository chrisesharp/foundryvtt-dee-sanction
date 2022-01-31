import { Logger } from "./logger.js";

export const loadCompendia = async function (compendia) {
    return await Promise.all(compendia.map((c) => {return loadCompendium(c);}));
}

export const unloadCompendia = async function (compendia) {
    return await Promise.all(compendia.map((c) => {return deleteFolder(c);}));
}

//const possessions = ["Clothing","Tools","Weapons","Printed Matter","Odds and Ends"];

async function deleteFolder(folderName) {
    let folder = game.folders.getName(folderName)
    if (folder) return Promise.all(folder.contents.map((e)=>{ e.delete()})).then(folder.delete());
    return Promise.resolve(`Folder ${folderName} doesn't exist.`);
}
async function loadCompendium (compendium) {
    const folderName = compendium;
    const folder = game.folders.getName(folderName);
    const packname = "dee." + compendium.toLowerCase().replace(/ /g,"-");
    const pack = game.packs.get(packname);
    if (pack) {
        if (folder) {
            let loaded = await folder.getFlag("dee","loaded");
            if (loaded === true) {
                return Promise.resolve(`${compendium} pack already imported`);
            }
            let imp = await pack.importAll({folderId:folder.id});
            folder.setFlag("dee","loaded",true);
            return imp;
        } else {
            let imp = await pack.importAll({folderName:folderName});
            const newFolder = game.folders.getName(folderName);
            if (newFolder && newFolder instanceof Folder) {
                newFolder.setFlag("dee","loaded",true);
            } else {
                log.error(`Couldn't find new folder ${folderName} for ${compendium}`);
            }
            return imp;
        }
    } else {
        return Promise.resolve(`Couldn't find ${packname} pack to import for ${compendium}`);
    }
}
