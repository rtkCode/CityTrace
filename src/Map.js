import { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal';
import { MapContainer, TileLayer, CircleMarker, Pane } from 'react-leaflet'
import "leaflet.heat"
import { compareDesc, parse } from 'date-fns'

import HeatMapLayer from "./components/HeatMapLayer"
import Calendar from "./components/Calendar"
import Drop from "./components/Drop"
import { CalendarIcon, UploadIcon, RefreshIcon, MarkerIcon } from "./components/Icon"

import './styles/Map.css';
import 'leaflet/dist/leaflet.css'

Modal.setAppElement('#root');

function Map() {
    const [map, setMap] = useState(null)

    const [geojsonData, setGeojsonData] = useState([]) // store original data

    const [fLocationData, setFLocationData] = useState([]) // selected data

    const [fGeoData, setFGeoData] = useState([]) // selected data

    const [isModalOpen, setModalOpen] = useState(false)

    const [isCalendarOpen, setCalendarOpen] = useState(false)

    const [isDropOpen, setDropOpen] = useState(false)

    const [modalDatetime, setModalDatetime] = useState("")

    const [dateRange, setDateRange] = useState(null)

    const [isMarkerShown, setMarkerShown] = useState(false)

    const position = [51.509865, -0.118092] // London lat lon

    const paneRef = useRef(null)

    useEffect(() => {
        getData()
    }, [map])

    useEffect(() => {
        filterData(geojsonData, dateRange)
    }, [dateRange])

    const markerList = fGeoData.map((feature) => {
        return <CircleMarker key={Math.random()} center={feature.geometry.coordinates} color={isMarkerShown?"#ff4d4d":"transparent"} weight="1" radius="5"
            eventHandlers={{
                click: () => {
                    setModalOpen(true);
                    setModalDatetime(feature.properties.datetime)
                },
            }}>
		</CircleMarker>
    })

    function getData(){
        fetch("data/Geo.json")
        .then(function(response){
            return response.json()
        })
        .then(function(data) {
            setGeojsonData(data)       
            filterData(data)
        })
        .catch(function() {
            setDropOpen(true)
        })
    }

    function filterData(geojson, dateRange){
        if(!dateRange){
            const locations = geojson.map((feature) => {
                return feature.geometry.coordinates
            })
            setFLocationData(locations)
            setFGeoData(geojson)
        } else {
            const selectedData = geojsonData.filter(feature => {
                const date = parse(feature.properties.datetime, "yyyy-MM-dd HH:mm:ss", new Date())
                return compareDesc(dateRange.from, date) === 1 && compareDesc(date, dateRange.to) === 1
            })
            setFGeoData(selectedData)

            const locations = selectedData.map((feature) => {
                return feature.geometry.coordinates
            })
            setFLocationData(locations)
        }
    }

    function closeAllModal() {
        setModalOpen(false)
        setCalendarOpen(false)
        setDropOpen(false)
    }

    function reposition() {
        map.fitBounds(fLocationData)
    }

	return (
		<div>
            <MapContainer id="map" center={position} zoom={13} scrollWheelZoom={true} zoomControl={false} ref={setMap}>
                <div className="tootip-overlay">
                    <RefreshIcon onClick={reposition} />
                    <CalendarIcon isOpen={isCalendarOpen} onClick={() => {closeAllModal("setCalendarOpen"); setCalendarOpen(!isCalendarOpen)}} />
                    <UploadIcon isOpen={isDropOpen} onClick={() => {closeAllModal("setCalendarOpen"); setDropOpen(!isDropOpen)}} />
                    <MarkerIcon isMarkerShown={isMarkerShown} onClick={() => setMarkerShown(!isMarkerShown)} />
                </div>
                <TileLayer attribution='<a href="https://github.com/rtkCode/CityTrace">CityTrace</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                />
                <HeatMapLayer locations={fLocationData} />
                <Pane ref={paneRef} name="markers">
                    { markerList }
                </Pane>
			</MapContainer>

            <Modal
                closeTimeoutMS={150}
                isOpen={isDropOpen}
                onRequestClose={() => setDropOpen(false)}
                contentLabel="drop"
                className="calendar-modal"
                overlayClassName="calendar-modal-overlay"
            >   
                <Drop setDropOpen={setDropOpen} setGeojsonData={setGeojsonData} filterData={filterData} />
            </Modal>

            <Modal
                closeTimeoutMS={150}
                isOpen={isModalOpen}
                onRequestClose={() => setModalOpen(false)}
                contentLabel="modal"
                className="common-modal"
                overlayClassName="common-modal-overlay"
            >
                <h1 style={{margin: "20px"}}>{ modalDatetime }</h1>
            </Modal>

            <Modal
                closeTimeoutMS={150}
                isOpen={isCalendarOpen}
                onRequestClose={() => setCalendarOpen(false)}
                contentLabel="calendar"
                className="calendar-modal"
                overlayClassName="calendar-modal-overlay"
            >   
                <Calendar dateRange={dateRange} setDateRange={setDateRange} setCalendarOpen={setCalendarOpen} />
            </Modal>
		</div>
	);
}

export default Map;