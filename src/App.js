import React, { createRef, useState } from 'react'
import { CosmosClient } from '@azure/cosmos'

import config from './config'

import Button from './styled/Button'
import Card from './styled/Card'
import TextInput from './styled/TextInput'

import 'bootstrap/dist/css/bootstrap-grid.min.css'
import './App.css'

const cognitiveKey = config.cognitiveKey

const endpoint = config.cosmosEndpoint
const cosmosMasterKey = config.cosmosMasterKey
const client = new CosmosClient({ endpoint, auth: { cosmosMasterKey } });

const faceListId = 'test_try'

const detectEndpoint = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&recognitionModel=recognition_02&returnRecognitionModel=true&returnRecognitionModel=false&detectionModel=detection_01'
const addFaceEndpoint = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/facelists/test_try/persistedFaces?detectionModel=detection_01'
// const addFaceEndpoint = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/persongroups/group_1/persons/9622a0b4-3866-4689-9846-4bfc83e69f97/persistedFaces?detectionModel=detection_01'
const identifyEndpoint = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/identify'
const findSimilarEndpoint = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/findsimilars'

function App() {
  const [ file, setFile ] = useState(null)
  const [ img, setImg ] = useState(null)
  const [ name, setName ] = useState('')
  const [ todos, setTodos ] = useState([])
  const textInputRef = createRef()

  const db = client.database('face2do_main')

  const inputFile = document.createElement('input')
  inputFile.setAttribute('type', 'file')
  inputFile.setAttribute('accept', 'image/*')

  // Functions
  const onInputChange = (e) => {
    const readerBuffer = new FileReader()
    readerBuffer.readAsArrayBuffer(e.target.files[0])

    readerBuffer.onload = ((data) => {
      setFile(data.target.result)
    })

    const readerUrl = new FileReader()
    readerUrl.readAsDataURL(e.target.files[0])

    readerUrl.onload = (data) => {
      setImg(data.target.result)
    }
  }

  inputFile.onchange = onInputChange
  const choosePhotoClick = (e) => {
    inputFile.click()
  }

  const addFindToDb = async (faceId) => {
    const container = db.container('faces')
    return await container.items.create({
      faceId,
      name: textInputRef.current.value || 'no_name',
    })
  }

  const findFaceFromDb = async (faceId) => {
    const container = db.container('faces')
    const querySpec = {
      query: `SELECT * FROM faces f WHERE f.faceId=@faceId`,
      parameters: [
        {
          name: '@faceId',
          value: faceId,
        },
      ],
    }
    const feedOptions = {
      enableCrossPartitionQuery: true,
    }

    return await container.items.query(querySpec, feedOptions).toArray()
  }

  const findTodosFromDb = async (faceId) => {
    const container = db.container('todos')
    const querySpec = {
      query: `SELECT * FROM todos d WHERE d.face_id=@faceId`,
      parameters: [
        {
          name: '@faceId',
          value: faceId,
        },
      ],
    }
    const feedOptions = {
      enableCrossPartitionQuery: true,
    }

    return await container.items.query(querySpec, feedOptions).toArray()
  }

  const onQueryClick = async () => {
    const container = db.container('faces')
    const result = await container.items.query().toArray()
    console.log(result)
  }

  const onAddFaceClick = (e) => {
    fetch(addFaceEndpoint, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': cognitiveKey,
      },
      body: file,
    })
    .then(result => result.json())
    .then((result) => {
      const { persistedFaceId } = result

      addFindToDb(persistedFaceId)
    })
  }

  const onDetectClick = (e) => {
    return fetch(detectEndpoint, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': cognitiveKey,
      },
      body: file,
    })
    .then(result => result.json())
    .then((result) => {
      return result
    })
  }

  const findsimilars = (faceId = null) => {
    const body = {
      faceId,
      faceListId,
      maxNumOfCandidatesReturned: 10,
      mode: 'matchPerson',
    }

    return fetch(findSimilarEndpoint, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': cognitiveKey,
      },
      body: JSON.stringify(body),
    })
    .then(result => result.json())
    .then((result) => {
      return result
    })
  }

  const onFind2DoClick = async (e) => {
    const detection = await onDetectClick()
    const similar = await findsimilars(detection[0].faceId)

    const { persistedFaceId, confidence } = similar[0]

    console.log('persistedFaceId', persistedFaceId)
    console.log('confidence', confidence)

    const { result: todos } = await findTodosFromDb(persistedFaceId)
    const { result } = await findFaceFromDb(persistedFaceId)
    const { name } = result[0]
    setName(name)
    setTodos(todos)
  }

  const _renderTodos = () => {
    return todos.map((todo, index) => (
      <Card key={index}>
        <p>{todo.todo}</p>
      </Card>
    ))
  }

  return (
    <>
      <div className="container full-h">
        <div className="row align-items-center full-h">
          <div className="col-10 offset-1">
            <Card>
              <div className="row">
                <div className="col-12">
                  <h2 className="title">Face2Do</h2>
                </div>
              </div>
              <div className="row">

                <div className="col-7">
                  <div className="row">
                    <div className="col-12" style={{ maxHeight: '60%', textAlign: 'center' }}>
                      <img src={img} alt=""
                        style={{
                          height: '100%',
                        }}
                      />
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <div className="col-12">
                    <Button kind="secondary" onClick={choosePhotoClick}>
                      Choose Photo
                    </Button>
                    <Button onClick={onFind2DoClick}>Find2Do</Button>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <TextInput ref={textInputRef} placeholder="Name"/>
                      <Button onClick={onAddFaceClick}>Add Face</Button>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <Button onClick={onDetectClick}>Detect</Button>
                      <Button onClick={onQueryClick}>Query</Button>
                    </div>
                  </div>
                </div>

                <div className="col-5">
                    <h3 style={{ marginTop: 0 }}>
                      {name}
                    </h3>
                    <h4 style={{ marginTop: 0 }}>Todos</h4>

                    <div className="row">
                      <div className="col-12">
                        { _renderTodos() }
                      </div>
                    </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
