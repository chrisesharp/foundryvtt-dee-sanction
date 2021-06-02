export const loadCompendia = async function (compendia) {
    return await Promise.all(compendia.map((c) => {return loadCompendium(c);}));
}

async function loadCompendium (compendium) {
    const folder = game.folders.find(f => f.name === compendium);
    const packname = "dee." + compendium.toLowerCase();
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
            let imp = await pack.importAll({folderName:compendium});
            let newFolder = game.folders.find(f => f.name === compendium);
            if (newFolder) {
                newFolder.setFlag("dee","loaded",true);
            } else {
                console.log("Couldn't find new folder for ",compendium);
            }
            return imp;
        }
    } else {
        return Promise.resolve(`Couldn't find ${comppendium} pack to import`);
    }
}
