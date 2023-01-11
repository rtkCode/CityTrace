import { FileUploader } from "react-drag-drop-files";

import "../styles/Drop.css"

export default function Drop(props) {
    const handleChange = (file) => {
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = () => {
            const geojson = JSON.parse(fileReader.result)
            props.setGeojsonData(geojson)       
            props.filterData(geojson)
            props.setDropOpen(false)
        }
    };

    return (
        <div className="drop-container">
            <p>1. Extract <code>Geo.json</code> by <a href="https://github.com/rtkCode/extract-EXIF-GeoJSON" target="_blank" rel="noreferrer" className="link">extract-EXIF-GeoJSON</a></p>
            <p>2. For personal use, you can move <code>Geo.json</code> into <code>data</code> directory.</p>
            <p>3. If this project is a public deployed, please import the JSON file.</p>
            <FileUploader classes="drop-zone" handleChange={handleChange} name="file" types={["JSON"]} label="Import or drop a file right here" hoverTitle="" />
            <small>CityTrace will not store your information.</small>
        </div>
    );

}