export const loadCompendia = async function (compendia) {
    return await Promise.all(compendia.map((c) => {return loadCompendium(c);}));
}

async function loadCompendium (compendium) {
    const folder = game.folders.entities.find(f => f.name === compendium);
    const packname = "dee." + compendium.toLowerCase();
    const pack = game.packs.get(packname);
    if (pack) {
        if (folder) {
            return await pack.importAll({folderId:folder.id});
        } else {
            return await pack.importAll({folderName:compendium});
        }
    } else {
        return Promise.resolve("No pack to import");
    }
}

// imp.then(result => {
//     console.log("Result:",result);
//     let newFolder = game.folders.entities.find(f => f.name === compendium);
//     if (newFolder) {
//         newFolder.setFlag("dee","loaded",true);
//     } else {
//         console.log("Couldn't find new folder ",compendium)
//     }
// });