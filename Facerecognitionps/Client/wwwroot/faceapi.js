function Facerecognition(img) {
    const imageUpload = document.getElementById(img)
    const container = document.getElementById('imageshow')

    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(start)

    async function start() {
        const labeledFaceDescriptors = await loadLabeledImages()
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)
        let image
        let canvas
        let pk = document.getElementById('heading')
        pk.innerHTML = "Loading..🔘"
        imageUpload.addEventListener('change', async () => {
            pk.innerHTML = "Recognition..👻"
            if (image) image.remove()
            if (canvas) canvas.remove()
            image = await faceapi.bufferToImage(imageUpload.files[0])
            container.append(image)
            canvas = faceapi.createCanvasFromMedia(image)
            container.append(canvas)
            const displaySize = { width: image.width, height: image.height }
            faceapi.matchDimensions(canvas, displaySize)
            const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                    drawBox.draw(canvas)
                    pk.innerHTML = `Hello ${result.label} 👻`;
            })
        })
    }

    function loadLabeledImages() {
        const labels = ['Praveen Sankhla', 'Komal Suthar', 'Tarun Vaya', 'Teenu Sharma']
        return Promise.all(
            labels.map(async label => {
                const descriptions = []
          
                    const img = await faceapi.fetchImage(`./labeled_images/${label}/${1}.jpg`)
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                    descriptions.push(detections.descriptor)
         
                return new faceapi.LabeledFaceDescriptors(label, descriptions)
            })
        )
    }
}

