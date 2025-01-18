const PLANNING_DOCS_URL = 'assets/data/planning_docs',
			PLANNING_DOCS_MAP = txtToObject(
`KEY	DOCUMENT	FILE_NAME
string	string	string
0	Los Angeles Municipal Code	municipal_code
1	1988 Hollywood Community Plan	general_plan
2	Community Redevelopment Agency	
3	HBD I	
4	reserved	
5	Planning Cases	zoning_ordinances
6	Hollywood Community Plan Update 1	
7	HBD II	
8	reserved	
9	Hollywood Community Plan Update 2	
10	reserved	`
);

class Parcel{
	constructor({ geometry = {}, attr = {} } = {}){
		this._shape = geometry;
		this._attr = {
			area: attributes.shape_area,
			perim: attributes.shape_len,
			currentCodes: [],
			potentialCodes: []
		};

		let { lamc_key, classification, htdist, limitation, overlay, condition, gplu_key, ord1_key, ord1, ord1sectns, ord2_key, ord2, ord2sectns, hcpu2_key } = attr;

		this
			.generateCode({ type: 0, key: gplu_key })
			.generateCode({ type: 1, key: lamc_key })
			.generateCode({ type: 5, key: ord1_key })
			.generateCode({ type: 5, key: ord2_key })
			.generateCode({ type: 9, key: hcpu2_key });
	}
	generateCode( { type = 0, key = '' } = {} ) {
		let container = key > 8 ? this._attr.potentialCodes : this._attr.currentCodes,
				retVal = {};

		container.push(retVal);
		return this;
	}
}