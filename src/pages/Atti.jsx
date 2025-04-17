import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { Header, HeaderContent, HeaderBrand, HeaderRightZone, HeaderSearch, FormGroup, Input, Container, Row, Col, Icon, Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Alert } from "design-react-kit";
import Select from 'react-select'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import logo from '../assets/logo-repubblica-italiana.svg';
import CookieConsent from "react-cookie-consent";
import { useCookies } from 'react-cookie';

const Atti = () => {
    // const apiUrl = process.env.REACT_APP_API_URL;
    const apiUrl = 'https://api.brcnet.it';
    const { codCli } = useParams();

    // Controllo se il parametro è disponibile
    if (!codCli) {
        console.error("Codice scuola mancante!");
        return <div>Errore: codice scuola mancante.</div>;
    }

    // header
    const [isOpenSearch, toggleModalSearch] = useState(false);
    const [loadingDownloadId, setLoadingDownloadId] = useState(null);
    const [istituto, setIstituto] = useState(null);

    const [isArchivio, toggleArchivio] = useState(false);

    const [visite, setVisite] = useState(0);
    const [cookies, setCookie] = useCookies(['brc_wap_visitato']);

    const [descrizione, setDescrizione] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const [tipologia, setTipologia] = useState(null);
    const [dataInizio, setDataInizio] = useState(new Date());
    const [dataFine, setDataFine] = useState(new Date());

    const [isOpen, toggleModal] = useState(false);
    const [atto, setAtto] = useState([]);
    const [allegati, setAllegati] = useState([]);

    const [atti, setAtti] = useState(null);
    const [tipologie, setTipologie] = useState(null);
    const [categorie, setCategorie] = useState(null);

    // get atti
    const getAtti = async (archivio = false, dataInizio = null, dataFine = null, categoria = null, tipologia = null, descrizione = null) => {
        axios.post(apiUrl + '/api/rest/v1/wap/atti/' + codCli, {
            page: 0,
            size: 10,
            archivio: archivio,
            filter: {
                dataInizio: dataInizio,
                dataFine: dataFine,
                categoria: categoria,
                tipologia: tipologia,
                descrizione: descrizione
            }
        }).then(res => {
            if (res.data.success) setAtti(res.data.payload);
        });
    }

    // get allegati
    const getAllegati = async (id) => {
        axios.get(apiUrl + '/api/rest/v1/wap/atti/' + codCli + '/allegati/' + id).then(res => {
            if (res.data.success)
                setAllegati(res.data.payload)
            else
                setAllegati([]);
        });
    }

    // recupera dati generali della scuola e albo
    useEffect(() => {
        // Chiamata a istituto
        axios.get(apiUrl + '/api/rest/v1/istituti/anagrafica/' + codCli).then(res => {
            if (res.data.success) setIstituto(res.data.payload);
        });

        // Chiamata a visite
        axios.get(apiUrl + '/api/rest/v1/wap/visite/' + codCli).then(res => {
            if (res.data.success) setVisite(res.data.payload);
        });

        // Aggiornamento visite (una sola volta)
        if (!cookies['brc_wap_visitato']) {
            axios.post(apiUrl + '/api/rest/v1/wap/addVisita/' + codCli)
                .then(() => setCookie('brc_wap_visitato', true, { path: '/' + codCli }));
        }

        // Chiamata a tipologie e categorie
        axios.get(apiUrl + '/api/rest/v1/wap/tipologie/' + codCli).then(res => {
            if (res.data.success) setTipologie(res.data.payload);
        });

        axios.get(apiUrl + '/api/rest/v1/wap/categorie/' + codCli).then(res => {
            if (res.data.success) setCategorie(res.data.payload);
        });

        // Chiamata iniziale per gli atti
        getAtti();
    }, [codCli, cookies, setCookie]);

    // visite
    useEffect(() => {
        if (!cookies['brc_wap_visitato']) {
            axios.post(apiUrl + '/api/rest/v1/wap/addVisita/' + codCli)
                .then(() => {
                    setCookie('brc_wap_visitato', true, { path: '/' + codCli });
                });
        }
    }, [cookies, codCli, setCookie]);

    // schermata caricamento
    if (!istituto || !atti || !tipologie || !categorie) return (
        <Container className='my-5'>
            <div className='w-100 d-flex flex-column align-items-center'>
                <Spinner active />
                <p className='fs-4 pt-3'>Caricamento in corso...</p>
            </div>
        </Container>
    );

    // render main page
    return (
        <div>
            <Header theme="" type="slim">
                <HeaderContent>
                    <HeaderBrand href={istituto.sitoweb} target='_blank' rel='noopener noreferrer'>
                        <span className='me-2'>Sito web istituzionale</span>
                        <Icon icon="it-external-link" size="sm" />
                    </HeaderBrand>
                    <HeaderRightZone>
                        <div className="it-access-top-wrapper">
                            <Button color="primary" size="sm" href='https://cloud.myscuola.it/' target='_blank' rel='noopener noreferrer'>
                                Accedi
                            </Button>
                        </div>
                    </HeaderRightZone>
                </HeaderContent>
            </Header>

            <Header theme="" type="center">
                <HeaderContent>
                    <HeaderBrand iconAlt="it code circle icon" iconName={logo} >
                        <h2>{istituto.intestazione.toUpperCase()}</h2>
                        <h3>Albo Online</h3>
                    </HeaderBrand>
                    <HeaderRightZone>
                        <HeaderSearch iconName="it-search" label="Cerca" onClick={() => toggleModalSearch(!isOpenSearch)} />
                    </HeaderRightZone>
                </HeaderContent>
            </Header>

            <Modal isOpen={isOpenSearch} toggle={() => toggleModalSearch(!isOpenSearch)} labelledBy='modalRicerca'>
                <ModalHeader toggle={() => toggleModalSearch(!isOpenSearch)} id='modalRicerca'>
                    Cerca
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Input type='text' id='nome-atto' label='Cerca per nome atto' onChange={(e) => setDescrizione(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color='secondary' onClick={() => toggleModalSearch(!isOpenSearch)}>
                        Chiudi
                    </Button>
                    <Button color='primary' onClick={() => {
                        toggleModalSearch(!isOpenSearch);
                        console.log(descrizione);
                        getAtti(isArchivio, null, null, null, null, descrizione);
                    }}>
                        Cerca
                    </Button>
                </ModalFooter>
            </Modal>

            <Container className='my-4'>
                <h2>{!isArchivio ? 'Pubblicazioni' : 'Archivio'}</h2>

                <Row>
                    <Col md="8" lg="9">
                        <Container>
                            <div className='my-2 d-flex justify-content-between'>
                                <span>{atti.length} pubblicazioni</span>
                                <Link onClick={() => {
                                    getAtti(!isArchivio);
                                    toggleArchivio(!isArchivio);
                                }} className='d-flex align-items-center text-decoration-none'>
                                    <span className="me-2">Visualizza atti {!isArchivio ? 'archiviati' : 'pubblicati'}</span>
                                    <Icon color="primary" icon="it-box" size="sm" />
                                </Link>
                            </div>

                            <div className='mt-2 border-top pt-3'>
                                {atti.map((atto, index) => {
                                    return (
                                        <article className="border-bottom pb-3 mb-3" key={index}>
                                            <Row>
                                                <Col xl="10">
                                                    <Row>
                                                        <Col xl="2">
                                                            <span className={"d-xl-block mt-1 px-4 rounded text-white text-center text-no-break bg-" + (isArchivio ? 'warning' : (atto.annullato == 1 ? 'danger' : 'success'))}>
                                                                {atto.numRegistro}/{new Date(atto.dataPubblicazione).getFullYear()}
                                                            </span>
                                                        </Col>
                                                        <Col xl="10" className="mt-2 mt-xl-0">
                                                            <h4 className="mt-0 mb-2">{atto.descrizione}</h4>

                                                            {atto.annullato ? (
                                                                <Alert color='danger'>
                                                                    Atto annullato in data <b>{new Date(atto.dataAnnullamento).toLocaleDateString('it-IT')}</b> dall'operatore <b>{atto.operatoreAnnullamento}</b>. Estremi: <b>{atto.estremiAnnullamento}</b>
                                                                </Alert>
                                                            ) : (
                                                                <></>
                                                            )}

                                                            <Row>
                                                                <Col>
                                                                    <Icon icon="it-calendar" size="sm" />
                                                                    <strong>Periodo di pubblicazione:</strong>
                                                                    <span className="d-block d-xl-inline"> dal {new Date(atto.dataPubblicazione).toLocaleDateString('it-IT')} al {new Date(atto.dataArchiviazione).toLocaleDateString('it-IT')}</span>
                                                                </Col>
                                                            </Row>

                                                            <Row className="mt-2 mt-xl-0">
                                                                <Col lg="6">
                                                                    <Icon icon="it-pa" size="sm" />
                                                                    <strong>Ufficio:</strong> {atto.unitaOperativa}
                                                                </Col>
                                                                <Col lg="6">
                                                                    <Icon icon="it-user" size="sm" />
                                                                    <strong>Responsabile:</strong> {atto.responsabile}
                                                                </Col>
                                                            </Row>

                                                            <Row className="mt-2 mt-xl-0">
                                                                <Col lg="6">
                                                                    <Icon icon="it-folder" size="sm" />
                                                                    <strong>Tipologia:</strong> {atto.tipologiaAtto}
                                                                </Col>
                                                                <Col lg="6">
                                                                    <Icon icon="it-folder" size="sm" />
                                                                    <strong>Categoria:</strong> {atto.categoria}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xl="2" className="mt-3 mt-xl-0">
                                                    <div className="d-flex flex-xl-column">
                                                        <Button color='primary' icon onClick={() => {
                                                            getAllegati(atto.id);
                                                            setAtto(atto);
                                                            toggleModal(true);
                                                        }}
                                                        >
                                                            <Icon color="white" icon="it-info-circle" size="sm" /> Dettagli
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </article>
                                    )
                                })}
                            </div>
                        </Container>
                    </Col>
                    <Col md="4" lg="3">
                        <Container>
                            <form action="" method="post">
                                <h5 className="mb-3 border-bottom pb-2 pt-4 pt-sm-0">
                                    <span>Filtri</span>
                                </h5>

                                <div className='mb-4'>
                                    <h6 className='fs-6'>Tipologie</h6>
                                    <Select
                                        options={tipologie}
                                        getOptionLabel={(option) => option.denominazione}
                                        getOptionValue={(option) => option.id}
                                        onChange={(val) => setTipologia(val['id'])}
                                    />
                                </div>

                                <div className='mb-4'>
                                    <h6 className='fs-6'>Categorie</h6>
                                    <Select
                                        options={categorie}
                                        getOptionLabel={(option) => option.denominazione}
                                        getOptionValue={(option) => option.id}
                                        onChange={(val) => setCategoria(val['id'])}
                                    />
                                </div>

                                <div className='mb-4'>
                                    <h6 className='fs-6'>Data inizio</h6>
                                    <DatePicker selected={dataInizio} onChange={(date) => setDataInizio(date)} dateFormat={'dd/MM/yyyy'} />
                                </div>

                                <div className='mb-4'>
                                    <h6 className='fs-6'>Data fine</h6>
                                    <DatePicker selected={dataFine} onChange={(date) => setDataFine(date)} dateFormat={'dd/MM/yyyy'} />
                                </div>

                                <div className="d-block">
                                    <Button color='primary' onClick={() => {
                                        getAtti(isArchivio, dataInizio, dataFine, categoria, tipologia, null);
                                    }}>Cerca</Button>
                                    {' '}
                                    <Button outline color='primary' onClick={() => {
                                        getAtti(isArchivio);
                                    }}>Pulisci Filtri</Button>
                                </div>
                            </form>
                        </Container>
                    </Col>
                </Row>

                <Modal isOpen={isOpen} toggle={() => toggleModal(!isOpen)} size='xl' labelledBy='modalAtto'>
                    <ModalHeader toggle={() => toggleModal(!isOpen)} id='modalAtto'>
                        <span className={"me-3 px-4 rounded text-white text-center text-no-break bg-" + (isArchivio ? 'warning' : (atto.annullato == null ? 'success' : 'danger'))}>
                            {atto.numRegistro}/{new Date(atto.dataPubblicazione).getFullYear()}
                        </span>
                        {atto.descrizione}
                    </ModalHeader>
                    <ModalBody>
                        {atto.annullato ? (
                            <Alert color='danger'>
                                Atto annullato in data <b>{new Date(atto.dataAnnullamento).toLocaleDateString('it-IT')}</b> dall'operatore <b>{atto.operatoreAnnullamento}</b>. Estremi: <b>{atto.estremiAnnullamento}</b>
                            </Alert>
                        ) : (
                            <></>
                        )}

                        <Row>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-horn" size="sm" />
                                <strong>Stato:</strong> {'archivio' == 'archivioo' ? 'Archiviato' : (atto.annullato == 1 ? 'Annullato' : 'Pubblicato')}
                            </Col>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-info-circle" size="sm" />
                                <strong>Tipologia:</strong> Integrale
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-calendar" size="sm" />
                                <strong>Inizio pubblicazione:</strong> {new Date(atto.dataPubblicazione).toLocaleDateString('it-IT')}
                            </Col>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-calendar" size="sm" />
                                <strong>Fine pubblicazione:</strong> {new Date(atto.dataArchiviazione).toLocaleDateString('it-IT')}
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-pa" size="sm" />
                                <strong>Ufficio:</strong> {atto.unitaOperativa} ({atto.ente})
                            </Col>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-user" size="sm" />
                                <strong>Responsabile:</strong> {atto.responsabile}
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-folder" size="sm" />
                                <strong>Tipologia:</strong> {atto.tipologiaAtto}
                            </Col>
                            <Col lg="6" className="mb-1">
                                <Icon icon="it-folder" size="sm" />
                                <strong>Categoria:</strong> {atto.categoria}
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col sm="12">
                                <h5>Documenti</h5>

                                {allegati != null ? (
                                    allegati.length > 0 ? (
                                        <div className="it-list-wrapper">
                                            <ul className="it-list">
                                                {allegati.map((allegato, index) => {
                                                    return (
                                                        <li key={index}>
                                                            <div className="list-item">
                                                                <div className="it-right-zone">
                                                                    <span className="text">
                                                                        <div>{allegato.nome}</div>
                                                                        <em>{allegato.path}</em>
                                                                    </span>
                                                                    <span className="it-multiple">
                                                                        {/* <a href="/" target="_blank" aria-label="Visualizza file">
                                                                        <Icon icon="it-password-visible" />
                                                                    </a> */}
                                                                        <a
                                                                            href="#"
                                                                            onClick={async (e) => {
                                                                                e.preventDefault();
                                                                                setLoadingDownloadId(allegato.id);
                                                                                try {
                                                                                    const res = await axios.get(`https://cloud.myscuola.it/wap/download_public.php?id=${allegato.id}&cod=${codCli}`);
                                                                                    if (res.data.success && res.data.payload) {
                                                                                        window.open(res.data.payload, '_blank');
                                                                                    } else {
                                                                                        alert("Impossibile scaricare il file: " + (res.data.error || "Errore sconosciuto"));
                                                                                    }
                                                                                } catch (err) {
                                                                                    alert("Errore durante il download");
                                                                                    console.error(err);
                                                                                } finally {
                                                                                    setLoadingDownloadId(null);
                                                                                }
                                                                            }}
                                                                            aria-label="Scarica allegato"
                                                                        >
                                                                            {loadingDownloadId === allegato.id ? (
                                                                                <Spinner active />
                                                                            ) : (
                                                                                <Icon icon="it-download" />
                                                                            )}
                                                                        </a>

                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div>Nessun allegato disponibile per questo atto.</div>
                                    )
                                ) : (
                                    <div>Caricamento allegati in corso...</div>
                                )}
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        {/* <Button color='outline-primary' onClick={() => toggleModal(!isOpen)}>
                        Copia Link
                    </Button> */}
                        <Button color='primary' onClick={() => toggleModal(!isOpen)}>
                            Chiudi
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>

            <footer className="it-footer">
                <div className="it-footer-main">
                    <Container>
                        <Row>
                            <Col sm='12'>
                                <div className="d-flex align-items-center py-4">
                                    <img height={'67px'} src={logo} alt="Stemma Repubblica Italiana" className='me-3' />
                                    <div className="it-brand-text">
                                        <h4 className='fs-4 m-0 p-0'>{istituto.intestazione.toUpperCase()}</h4>
                                        <h6 className='fs-6 fw-normal m-0 p-0'>Albo Online</h6>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row className='py-4 border-white border-top'>
                            <Col lg='4' md='4' className="pb-2">
                                <p>
                                    <strong>Indirizzo</strong><br />
                                    {istituto.indirizzo.toUpperCase()} <br />
                                    {istituto.cap.toUpperCase()} - {istituto.citta.toUpperCase()} ({istituto.prov.toUpperCase()})
                                </p>
                            </Col>
                            <Col lg='4' md='4' className="pb-2">
                                <p>
                                    <strong>Contatti</strong><br />
                                    E-Mail: {istituto.email}<br />
                                    PEC: {istituto.pec}<br />
                                    Telefono: {istituto.telefono}<br />
                                </p>
                            </Col>
                            <Col lg='4' md='4' className="pb-2">
                                <p>
                                    <strong>Statistiche</strong><br />
                                    Numero visite: {visite}
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </div>

                <div className="it-footer-small-prints">
                    <Container className='d-flex justify-space-between'>
                        <ul className="it-footer-small-prints-list list-inline m-0 px-0 d-flex flex-column flex-md-row">
                            <li className="list-inline-item">
                                <a href='https://brcinformatica.it/privacy' target="_blank" rel='noopener noreferrer'>Privacy</a>
                            </li>
                            <li className="list-inline-item">
                                <Link to={'/' + codCli + '/feed-rss'} title="Feed RSS">Feed RSS</Link>
                            </li>
                            <li className="list-inline-item">
                                <a href='https://brcinformatica.it/contatti' target="_blank" rel='noopener noreferrer'>Segnalazioni</a>
                            </li>
                            <li className="list-inline-item">
                                <a href='https://brcinformatica.it/' target="_blank" rel='noopener noreferrer'>Crediti</a>
                            </li>
                        </ul>
                    </Container>
                </div>
            </footer>

            <CookieConsent
                location="bottom"
                buttonText="Ok, ho capito!"
                cookieName="brc_wap_cookie"
                style={{ background: "#2B373B" }}
                buttonStyle={{ color: "#fff", backgroundColor: "#0066CC", fontWeight: "bold" }}
                expires={150}
            >
                Questo sito web utilizza alcuni cookie tecnici necessari al funzionamento del software.
                Per più informazioni su quali cookies potrebbero essere utilizzati su questa applicazione clicca <a className='text-white' href='https://brcinformatica.it/privacy' target="_blank" rel='noopener noreferrer'>Leggi di più</a>
            </CookieConsent>
        </div>
    )
}

export default Atti;
