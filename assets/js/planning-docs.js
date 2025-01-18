const fs = require('fs');

const txtToObject = require('./txt-to-object.js');

/**
	*/
class PlanningDocs extends Map{
	constructor({ folderURL = '' } = {}){
		super();
		this._docIndex = txtToObject( fs.readFileSync( folderURL + 'document_index.txt', 'utf-8' ) );
		
		for ( let entry of this._docIndex.entries() ){
			try {
				this.set( entry[0], {
					name: entry[1].document,
					database: txtToObject( fs.readFileSync( folderURL + entry[1].file_name + '.txt', 'utf-8' ) ),
					reference: txtToObject( fs.readFileSync( folderURL + entry[1].file_name + '_ref.txt', 'utf-8' ) ),
				});
			}
			catch (e){}
		}
	}
}

module.exports = PlanningDocs;