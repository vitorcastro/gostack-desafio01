const express = require("express");
const cors = require("cors");
const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function checkIdExists(request, response, next)
{
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex( repository => repository.id === id)

  if (repositoryIndex < 0)
    return response.status(400).json( {error: "Repository not found"} );

  return next();
}

function getRepositoryById(id)
{
  const repositoryIndex = repositories.findIndex( repository => repository.id === id)
  return { object: repositories[repositoryIndex], index: repositoryIndex } ;
}

function updateRepository(repository,index)
{
  repositories[index] = repository;
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {

  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex( repository => repository.title === title)

  if (repositoryIndex < 0)
  {
    const repository = {
      id: uuid(),
      title: title,
      url: url,
      techs: techs,
      likes: 0,
    }
    repositories.push(repository);
    return response.status(201).json( repository );

  }else{
    const repository = repositories[repositoryIndex]
    return response.status(200).json( repository );
  }
  
});

app.put("/repositories/:id", checkIdExists ,(request, response) => {

  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repository = getRepositoryById(id);

  const repositoryUpdate = {
      id: repository.object.id,
      title: title,
      url: url,
      techs: techs,
      likes: repository.object.likes,
    }

    updateRepository(repositoryUpdate,repository.index);
    
    return response.status(200).json(repositoryUpdate);

});

app.delete("/repositories/:id", checkIdExists, (request, response) => {
  
  const { id } = request.params;
  const repository = getRepositoryById(id);
  repositories.splice(repository.index,1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", checkIdExists, (request, response) => {

  const { id } = request.params;

  const repository = getRepositoryById(id);

  const repositoryUpdate = {
      id: repository.object.id,
      title: repository.object.title,
      url: repository.object.url,
      techs: repository.object.techs,
      likes: repository.object.likes+1,
  }

  updateRepository(repositoryUpdate,repository.index);

  return response.status(200).json(repositoryUpdate);

});

module.exports = app;