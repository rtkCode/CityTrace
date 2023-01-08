import { useState, useEffect, useRef } from "react"
import { FileUploader } from "react-drag-drop-files";

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
        <FileUploader handleChange={handleChange} name="file" types={["JSON"]} />
    );

}