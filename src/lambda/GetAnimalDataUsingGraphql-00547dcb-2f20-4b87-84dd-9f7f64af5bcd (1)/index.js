const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log("event", event);

    const { fieldName, arguments: { filter } = {} } = event;

    const classTypes = {
        1: 'Mammal',
        2: 'Bird',
        3: 'Reptile',
        4: 'Fish',
        5: 'Amphibian',
        6: 'Bug',
        7: 'Invertebrate'
    };

    try {
        const params = { TableName: 'AnimalData' };
        const data = await dynamodb.scan(params).promise();

        switch (fieldName) {
            case "getAnimalClassSummary":
                return getAnimalClassSummary(data.Items, classTypes);

            case "getAnimalByTrail":
                return getAnimalByTrail(data.Items, classTypes, filter);

            default:
                return {
                    statusCode: 400,
                    error: 'Invalid fieldName'
                };
        }
    } catch (err) {
        console.error('DynamoDB error: ', err);
        return {
            statusCode: 500,
            error: 'Could not fetch data'
        };
    }
};

const getAnimalClassSummary = (items, classTypes) => {
    const animalCounts = items.reduce((counts, animal) => {
        const classType = classTypes[animal.class_type];
        counts[classType] = (counts[classType] || 0) + 1;
        return counts;
    }, {});

    const result = Object.keys(animalCounts).map(classType => ({
        class_number: Number(Object.keys(classTypes).find(key => classTypes[key] === classType)),
        class_type: classType,
        number_of_animals: animalCounts[classType]
    }));

    return { items: result };
};

const getAnimalByTrail = (items, classTypes, filter) => {
    let filteredAnimals = items;

    if (filter) {
        const { trail, class_type, class_number } = filter;

        if (trail) {
            const isDomestic = trail.toLowerCase() === 'domestic' ? 1 : 0;
            filteredAnimals = filteredAnimals.filter(animal => animal.domestic === isDomestic);
        }

        if (class_type) {
            const classTypeNumber = Number(Object.keys(classTypes).find(key => classTypes[key] === class_type));
            if (classTypeNumber) {
                filteredAnimals = filteredAnimals.filter(animal => animal.class_type == classTypeNumber);
            }
        }

        if (class_number) {
            filteredAnimals = filteredAnimals.filter(animal => animal.class_type == class_number);
        }
    }

    const result = filteredAnimals.map(animal => ({
        animal_name: animal.animal_name,
        class_type: classTypes[animal.class_type]
    }));

    return { items: result };
};
