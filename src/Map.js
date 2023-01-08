import { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal';
import { MapContainer, TileLayer, CircleMarker, Pane, FeatureGroup } from 'react-leaflet'
import "leaflet.heat"
import { compareDesc, parse } from 'date-fns'

import HeatMapLayer from "./components/HeatMapLayer"
import Calendar from "./components/Calendar"
import Drop from "./components/Drop"

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

    const position = [51.509865, -0.118092] // London lat lon

    const featureGroupRef = useRef(null)

    useEffect(() => {
        getData()
    }, [map])

    useEffect(() => {
        filterData(geojsonData, dateRange)
    }, [dateRange])

    // useEffect(() => {
    //     if (!map) return
    //     map.fitBounds(featureGroupRef.current.getBounds())
    // }, [featureGroupRef.current])

    const markerList = fGeoData.map((feature) => {
        return <CircleMarker key={Math.random()} center={feature.geometry.coordinates} color="transparent" radius="6"
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

	return (
		<div>
            <MapContainer id="map" center={position} zoom={13} scrollWheelZoom={true} zoomControl={false} ref={setMap}>
                <div className="tootip-overlay">
                    <div className="icon-calender">
                        <svg xmlns="http://www.w3.org/2000/svg" onClick={() => {setCalendarOpen(true); setModalOpen(false)}} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                </div>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <HeatMapLayer locations={fLocationData} />
                <Pane name="custom">
                {/* <FeatureGroup ref={featureGroupRef} > */}
                    { markerList }
                {/* </FeatureGroup> */}
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