import BookModel from '../model/bookModel';
import fs from 'fs/promises';
import path from 'path';
import sequelize from '../config/databaseConfig';

const dirPath = path.join(__dirname, '../books');

export async function syncDatabaseAndLoadBooks() {
    try {
        await sequelize.sync();
        console.info("Database & tables created!");

        // Get all files/subdirectories in the dirPath
        const items = await fs.readdir(dirPath);

        // Filter out any files and leaves only subdirectories
        const genres = [];
        for (const item of items) {
            if ((await fs.stat(path.join(dirPath, item))).isDirectory()) {
                genres.push(item);
            }
        }

        for (let genre of genres) {
            const genrePath = path.join(dirPath, genre);

            // Get all files/subdirectories in the genrePath
            const items = await fs.readdir(genrePath);

            // Filter out any subdirectories and leaves only files
            const files = [];
            for (const item of items) {
                if ((await fs.stat(path.join(genrePath, item))).isFile()) {
                    files.push(item);
                }
            }

            for (let file of files) {
                const filePath = path.join(genrePath, file);
                const data = await fs.readFile(filePath);

                // Reformat the book's name
                let name = file.split(".pdf")[0];
                name = name.replace(/-/g, " ");

                const book = await BookModel.findOne({
                    where: { name: name },
                });

                // If the book wasn't found, create a new one
                if (!book) {
                    await BookModel.create({
                        name: name,
                        genre: genre,
                        data: data,
                    });

                    console.log(`Inserted file: ${name}`);
                }
            }
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}