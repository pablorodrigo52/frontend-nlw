import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

import './style.css';

const Success = () =>{
    return (
        <div className="background">
            <span className="content">
                <span>
                    <FiCheckCircle/>
                </span>
                <h2>Ponto de coleta cadastrado com sucesso!</h2>
                <Link to="/">
                    <strong>Ok</strong>
                </Link>
            </span>
        </div>
    );
}


export default Success