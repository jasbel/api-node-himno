Este proyecto es la inicizacion de la api para himnos, aun en su primera fase, obtenendra los valores que se agreguen

pasos de instalacion
* clonar repositorio
* ir a la carpeta
* `npm i`
* prueba en desarrollo `npm run dev`

api de prueba para crear
```
// {{base_url}}/songs

{
    "num_song": 2,
    "title": "test",
    "description": "description",
    "musicalNote": "Do",
    "paragraphs": [
        {
        "paragraph": "mi-paragraph",
        "chorusPos": []
        },
        {
        "paragraph": "mi-paragraph-2",
        "chorusPos": []
        }
    ],
    "chorus": "['chorus']"
}
```

docker run --name my-postgres -e POSTGRES_DB=songsdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
# docker execute
`chmod +x bash.sh`
`zsh bash.sh`
`#!/bash/zsh`
Comando de depuracion
`zsh -x bash.sh`
verificar la codificaon del archivo
`file bash.sh`
