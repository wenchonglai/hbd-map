define(['js/fs', 'js/txt-to-object'], function(fs, txtToObject){
class PlanningDocs extends Map{
	constructor({ folderURL = '' } = {}){
		super();
		this._folderURL = folderURL;
	}
	async build(){
		await fs.readFile( this._folderURL + 'document_index.txt', 'utf-8', (err, data) => {
			this._docIndex = txtToObject(data, 'utf-8');
		});

		for ( let entry of this._docIndex.entries() ){
			let database, reference, filePrefix = this._folderURL + entry[1].file_name;

			await Promise.all(['.txt', '_ref.txt'].map( suffix => 
				fs.readFile( filePrefix + suffix, 'utf-8' )
					.then( ([ err, data ]) => {
						if ( data ) return Promise.resolve(data);
						return Promise.reject(err);
					})
				)
			)
			.then( ([ database, reference ]) => {
				this.set( entry[0], {
					name: entry[1].document,
					database: txtToObject(database, 'utf-8'),
					reference: txtToObject(reference, 'utf-8'),
				});
			})
			.catch( e => {});
		}

		return this;
	}
}

return PlanningDocs;

})
