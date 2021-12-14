import '../index.css';
import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ImagePopup from './ImagePopup';
import InfoTooltipPopup from './InfoTooltipPopup';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import apiUser from '../utils/ApiUser';
import api from '../utils/Api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = React.useState(false);
  const [isLuck, setIsLuck] = React.useState('');
  const [selectedCard, setSelectedCard] = React.useState({ isOpen: false, name: '', link: ''});  
  const [currentUser, setCurrentUser] = React.useState({});
  const [usereEmail, setUserEmail] = React.useState({ email: '' });
  const [cards, setCards] = React.useState([]);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const history = useHistory();

  React.useEffect(() => {
    if(loggedIn === true) {
      history.push('/');
    }
  }, [loggedIn, history]);

  React.useEffect(() => {
    tokenCheck();
  }, []);

  React.useEffect(() => {
    if(isLuck === true) {
      history.push('/signin');
    }
  }, [isLuck, history]);
  
  function handleRegister({ email, password }) {
    apiUser.addUser({ email, password })
    .then((data) => {
      handleInfoTooltipPopup(true);
    })
    .catch((err) => {
      handleInfoTooltipPopup(false);
      console.log(err); // "Что-то пошло не так: ..."
    });
  }
  
  function handleLogin({ email, password }) {
    apiUser.enterUser({ email, password })
    .then((user) => {
      localStorage.setItem('jwt', user.token);
      setLoggedIn(true);      
    })
    .catch((err) => {
      console.log(err); // "Что-то пошло не так: ..."
    });
  }

  function tokenCheck() {
    const jwt = localStorage.getItem('jwt');

    if(jwt) {
      apiUser.getToken({ jwt })
      .then((user) => {
        setUserEmail(user.data.email);
        setCurrentUser(user.data);
        setLoggedIn(true);
      })
      .catch((err) => {
        console.log(err); // "Что-то пошло не так: ..."
      });
    }
  }

  function handleLogout() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
  }

  function handleInfoTooltipPopup(isLuck) {
    setIsLuck(isLuck);
    setIsInfoTooltipPopupOpen(true);
  }

  React.useEffect(() => {
    api.getItemsUser()
    .then((data) => {
        setCurrentUser(data.date);
    })
    .catch((err) => {
        console.log(err); // "Что-то пошло не так: ..."
    });
  }, [loggedIn]);

  React.useEffect(() => {        
    api.getItemsCards()
    .then((data) =>{    
      console.log(data)       
        setCards(data.data);
    })
    .catch((err) => {
        console.log(err); // "Что-то пошло не так: ..."
    });

  }, [loggedIn]);

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i === currentUser._id);    
    // Отправляем запрос в API и получаем обновлённые данные карточки
    api.toggleLikeCard(card._id, isLiked)
    .then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard.data : c));
    })
    .catch((err) => {
      console.log(err); // "Что-то пошло не так: ..."
    });
  }

  function handleCardDelete(card) {
    api.deleteCardUser(card._id)
    .then(() => {
      setCards((cards) => cards.filter((c) => c._id !== card._id));
    })
    .catch((err) => {
      console.log(err); // "Что-то пошло не так: ..."
    });
  }
    
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleCardClick(name, link) {
    setSelectedCard({
      isOpen: true,
      name: name,
      link: link,
    })
  }

  React.useEffect(() => {
    const closeByEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllPopups();
      }
    }

    document.addEventListener('keydown', closeByEscape);
    
    return () => document.removeEventListener('keydown', closeByEscape);
  }, []);

  function closeAllPopups(){
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setSelectedCard({
      isOpen: false,
      name: '',
      link: '',
    });
    setIsInfoTooltipPopupOpen(false);
  }

  function handleUpdateUser(props) {
    api.editProfile(props)
    .then((data) => {
      console.log(data)
      setCurrentUser(data.data);
      closeAllPopups();     
    })
    .catch((err) => {
      console.log(err); // "Что-то пошло не так: ..."
    });
  }

  function handleUpdateAvatar(props) {
    api.editAvatar(props)
    .then((data) => {
      setCurrentUser(data.data);
      closeAllPopups();     
    })
    .catch((err) => {
      console.log(err); // "Что-то пошло не так: ..."
    });
  }
  
  function handleAddPlaceSubmit(props) {
    api.addCardForm(props)
    .then((newCard) => {
      setCards([newCard.data, ...cards]);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err); // "Что-то пошло не так: ..."
    });
  }
  
  return (
    <div className="root">
      <CurrentUserContext.Provider value = {currentUser}>
        {/* <Header /> */}
        <Switch>          
          <Route exact path="/signin">
            <Login onLogin={handleLogin} tokenCheck={tokenCheck} />
          </Route>
          <Route path="/signup">
            <Register onRegister={handleRegister} />
          </Route>
          <ProtectedRoute
            path = "/"
            loggedIn = {loggedIn}
            component = {Main}
            onEditAvatar = {handleEditAvatarClick}
            onEditProfile = {handleEditProfileClick}
            onAddPlace = {handleAddPlaceClick}
            onCardClick = {handleCardClick}
            cards = {cards}
            onCardLike = {handleCardLike}
            onCardDelete = {handleCardDelete}
            onLogout = {handleLogout}
            userDate = {usereEmail}
          />
        </Switch>
        <Footer />        
        <EditProfilePopup
            isOpen = {isEditProfilePopupOpen}
            onClose = {closeAllPopups}
            onUpdateUser = {handleUpdateUser}/>
        <EditAvatarPopup
            isOpen = {isEditAvatarPopupOpen}
            onClose = {closeAllPopups}
            onUpdateAvatar = {handleUpdateAvatar} />
        <AddPlacePopup
            isOpen = {isAddPlacePopupOpen}
            onClose = {closeAllPopups}
            onAddPlace = {handleAddPlaceSubmit} />        
        <PopupWithForm
            name = "delete-card"
            title = "Вы уверены?"
            buttonText = "Удалить" />
        <ImagePopup
            isOpen = {selectedCard.isOpen ? "popup_is-opened" : ""}
            onClose = {closeAllPopups}
            name = {selectedCard.name}
            link = {selectedCard.link} />
        <InfoTooltipPopup
            isOpen = {isInfoTooltipPopupOpen ? "popup_is-opened" : ""}
            onClose = {closeAllPopups}
            name = "tooltipe"
            isLuck = {isLuck} />
      </CurrentUserContext.Provider>   
    </div>
  );
}

export default App;
