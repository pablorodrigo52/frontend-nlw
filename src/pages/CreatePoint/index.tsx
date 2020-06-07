import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';

import './styles.css';
import logo from '../../assets/logo.svg';

// array ou objeto: é necessário informar manualmente o tipo da variavel que vai ser armazenada porque se não o react não deixa acessar logo abaixo
interface Item {
    id: number;
    name: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse{
    nome: string;
}

const CreatePoint = () => {
    let [uf, setUF] = useState<string[]>([]);
    let [items, setItems] = useState<Item[]>([]);
    let [cities, setCities] = useState<string[]>([]);
    
    let [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

    let [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    let [selectedUf, setSelectedUf] = useState('0');
    let [selectedCity, setSelectedCity] = useState('0');
    let [selectedItems, setSelectedItems] = useState<number[]>([]);
    let [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);

    let history = useHistory();
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position => {
            let { latitude, longitude } = position.coords; // navigator is a global var from javsacript
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(()=>{
        api.get('items').then(response =>{
            setItems(response.data);
        });
    }, []); // O que estou executando, quando vou executar (se vazio, vou executar uma única vez)
    
    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response=>{
            let ufInitials = response.data.map(uf => uf.sigla);
            setUF(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0'){
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response=>{
            let cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        });

    }, [selectedUf]);

    function handleSelectUf(e: ChangeEvent<HTMLSelectElement>){
        setSelectedUf(e.target.value);
    }

    function handleSelectCity(e: ChangeEvent<HTMLSelectElement>){
        setSelectedCity(e.target.value);
    }

    function handleMapClick(e: LeafletMouseEvent){
        setSelectedPosition([
            e.latlng.lat,
            e.latlng.lng
        ]);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>){
        let { name, value } = e.target;
        setFormData({...formData, [name]: value});
    }

    function handleSelectItem(id: number){
        if (selectedItems.findIndex(item => item === id) >= 0){
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(e: FormEvent){
        e.preventDefault();

        let { name, email, whatsapp } = formData;
        let uf = selectedUf;
        let city = selectedCity;
        let [latitude, longitude] = selectedPosition;
        let items = selectedItems;

        let data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items,
        }

        await api.post('points', data);
    
        history.push('/success');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br/>ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input onChange={handleInputChange} type="text" name="name" id="name"/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input onChange={handleInputChange} type="email" name="email" id="email"/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input onChange={handleInputChange} type="text" name="whatsapp" id="whatsapp"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map onClick={handleMapClick} center={initialPosition} zoom={15}>
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {uf.map(uf=> (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select value={selectedCity} onChange={handleSelectCity} name="city" id="city">
                                <option value="0">Selecione uma cidade</option>
                                {
                                    cities.map(city => (
                                    <option key={city} value={city}>{city}</option>    
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li className={selectedItems.includes(item.id) ? 'selected' : ''}
                                key={item.id} onClick={() => handleSelectItem(item.id)}>
                                <img src={item.image_url} alt={item.name}/>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;