function Facerecognition(vid, canva) {
    let video = document.getElementById(vid)
    let canvasimg = document.getElementById(canva)
    let container = document.getElementById('imageshow')
    let click_btn = document.getElementById('clickphoto')

    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(start)

    async function start() {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;

        const labeledFaceDescriptors = await loadLabeledImages()
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)
        let image
        let pk = document.getElementById('heading')
        pk.innerHTML = "Loading..."
        click_btn.addEventListener('click', async () => {
            canvasimg.getContext('2d').drawImage(video, 0, 0, canvasimg.width, canvasimg.height);
            let image_data_url = canvasimg.toDataURL('image/jpeg');

            pk.innerHTML = "Recognition..👻"
            if (image) image.remove()
            if (canvasimg) canvasimg.remove()
            const newImage = new Image();
            newImage.src = image_data_url;
            image = newImage

            container.append(image)
            container.append(canvasimg)
            const displaySize = { width: canvasimg.width, height: canvasimg.height }
            faceapi.matchDimensions(canvasimg, displaySize)
            const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            results.forEach((result, i) => {
                pk.innerHTML = `Hello ${result.label} 👻`;
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvasimg)
            })
        })
    }

    function loadLabeledImages() {
        const labels = ['Praveen Sankhla', 'Komal Suthar', 'Tarun Vaya', 'Teenu Sharma', 'Ridhi']
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

