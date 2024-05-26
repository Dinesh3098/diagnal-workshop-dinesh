`type AnimalData {
	class_number: Int
	class_type: String
	number_of_animals: Int
}

type AnimalDataConnection {
	items: [AnimalData]
}

type AnimalDataConnectionTrail {
	items: [AnimalDataTrail]
}

type AnimalDataTrail {
	animal_name: String
	class_type: String
}

input TableAnimalDataFilterInput {
	trail: String
	class_number: Int
	class_type: String
}

type UploadURLResponse {
	path: String
	uploadURL: String
}

type Query {
	gets3PresignedURLtoUploadFile(path: String): UploadURLResponse
	getAnimalClassSummary: AnimalDataConnection
	getAnimalByTrail(filter: TableAnimalDataFilterInput): AnimalDataConnectionTrail
}
`