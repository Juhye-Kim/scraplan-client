import React, { useCallback, useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getGoogleToken, userEditInfo, withdraw } from "../actions";
import Navbar from "../components/UI/Navbar";
import Modal from "../components/UI/Modal";
import { RootState } from "../reducers";

const EditUserInfo = () => {
  const userState = useSelector((state: RootState) => state.userReducer);
  const {
    user: { token, email, nickname },
    googleToken,
  } = userState;
  const dispatch = useDispatch();
  const history = useHistory();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalComment, setModalComment] = useState<string>("");
  const [modalType, setModalType] = useState<string>("");
  const [inputNickname, setInputNickname] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputPasswordCheck, setInputPasswordCheck] = useState<string>("");
  const [inputWithdrawal, setInputWithdrawal] = useState<string>("");
  const [editDenyMessage, setEditDenyMessage] = useState<string>("");
  const [withdrawalDenyMessage, setWithdrawalDenyMessage] = useState<string>(
    "",
  );
  const [withdrawalHidden, setWithdrawalHidden] = useState<boolean>(true);
  const [acceptActionType, setAcceptActionType] = useState<string>("");
  const refEmail = useRef<HTMLInputElement>(null);
  const refNickName = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);
  const refPasswordCheck = useRef<HTMLInputElement>(null);
  const refWithdrawal = useRef<HTMLInputElement>(null);

  const handleModalOpen = () => {
    setOpenModal(true);
  };
  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleChangeNickname = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputNickname(e.target.value);
    },
    [inputNickname],
  );
  const handleChangePassword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputPassword(e.target.value);
    },
    [inputPassword],
  );
  const handleChangePasswordCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputPasswordCheck(e.target.value);
    },
    [inputPasswordCheck],
  );
  const handleChangeWithdrwal = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputWithdrawal(e.target.value);
    },
    [inputWithdrawal],
  );
  const handleMoveTopassword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      refPassword.current?.focus();
    }
  };
  const handleMoveTopasswordCheck = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      refPasswordCheck.current?.focus();
    }
  };

  // ????????? ??????
  const checkValidPassword = useCallback(
    (password) => {
      if (!/^(?=.*[a-zA-Z])((?=.*\d)|(?=.*\W)).{6,20}$/.test(password)) {
        setEditDenyMessage(
          "????????? + ??????/???????????? ???????????? 8~20????????? ???????????? ?????????.",
        );
        return false;
      }
      const check_num = password.search(/[0-9]/g);
      const check_eng = password.search(/[a-z]/gi);
      if (check_num < 0 || check_eng < 0) {
        setEditDenyMessage("??????????????? ????????? ???????????? ??????????????? ?????????.");
        return false;
      }
      if (/(\w)\1\1\1/.test(password)) {
        setEditDenyMessage(
          "??????????????? ?????? ????????? 4??? ?????? ???????????? ??? ????????????.",
        );
        return false;
      }
      return true;
    },
    [inputPassword, editDenyMessage],
  );

  const handleCompleteInput = (): boolean => {
    if (!checkValidPassword(inputPassword)) {
      refPassword.current?.focus();
      return false;
    } else if (checkValidPassword(inputPassword)) {
    }
    if (inputPasswordCheck !== inputPassword) {
      refPasswordCheck.current?.focus();
      setEditDenyMessage("??????????????? ?????? ??????????????????");
      return false;
    }
    return true;
  };

  // ???????????? ??????
  const handleUserEditInfo = () => {
    // ???????????? ????????? ?????? ??? ???????????? ???
    if (googleToken.length > 1) {
      setAcceptActionType("edit");
      setModalType("yesNoModal");
      setModalComment("??????????????? ?????????????????????????");
      handleModalOpen();
    } else if (handleCompleteInput()) {
      setAcceptActionType("edit");
      setModalType("yesNoModal");
      setModalComment("??????????????? ?????????????????????????");
      handleModalOpen();
    }
  };
  // ?????? - ??????????????? ?????? ????????? ??? ???????????? ??????
  const handleAcceptUserEditInfo = () => {
    handleModalClose();
    let body;
    if (googleToken.length > 1) {
      body = JSON.stringify({
        email,
        nickname: inputNickname,
      });
    } else {
      body = JSON.stringify({
        email,
        nickname: inputNickname,
        password: inputPassword,
      });
    }
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/edit-info`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        credentials: "include",
      },
      body,
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.accessToken) {
          setInputPassword("");
          setInputPasswordCheck("");
          dispatch(userEditInfo(body.accessToken, email, inputNickname));
          setModalType("alertModal");
          setModalComment("?????? ?????? ????????? ?????????????????????.");
          handleModalOpen();
          setTimeout(() => {
            history.push("/mypage");
          }, 1000);
        } else if (body.message === "Insufficient info") {
          setEditDenyMessage("????????? ??????????????????.");
        } else if (body.message === "Password is wrong!") {
          refPassword.current?.focus();
          setEditDenyMessage("??????????????? ???????????????.");
        } else if (body.message === "Expired token" || "Invalid token") {
          refPassword.current?.focus();
          setEditDenyMessage("??? ????????? ??? ??????????????????.");
        } else if (body.message === "Already exists nickname") {
          refNickName.current?.focus();
          setEditDenyMessage("???????????? ??????????????????.");
        }
      })
      .catch((err) => console.log(err));
  };
  // ?????? ??????
  const handleWithDrawal = () => {
    // ????????? ?????? ??? ??????????????? ???????????? ????????? ?????? ??????
    if (withdrawalHidden && googleToken.length <= 1) {
      setWithdrawalHidden(false);
      return;
    }
    if (inputWithdrawal === "" && googleToken.length <= 1) {
      setWithdrawalDenyMessage("??????????????? ??????????????????.");
      return;
    }
    setWithdrawalDenyMessage("");
    setModalType("yesNoModal");
    setModalComment("?????? ?????????????????????????");
    setAcceptActionType("withdrawal");
    handleModalOpen();
    return;
  };
  // ?????? - ??????????????? ?????? ????????? ??? ???????????? ??????
  const handleAcceptWithdrawal = () => {
    handleModalClose();
    let body;
    let api;
    if (googleToken.length > 1) {
      body = JSON.stringify({
        email,
        hashData: googleToken,
      });
      api = "/google-sign/withdraw";
    } else {
      body = JSON.stringify({
        email,
        password: inputWithdrawal,
      });
      api = "/sign/withdraw";
    }
    fetch(`${process.env.REACT_APP_SERVER_URL}${api}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        credentials: "include",
      },
      body,
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.message === "Successfully processed") {
          dispatch(withdraw());
          dispatch(getGoogleToken(""));
          setModalType("alertModal");
          setModalComment("????????? ?????????????????????.");
          handleModalOpen();
          setTimeout(() => {
            history.push("/");
          }, 1000);
        } else if (body.message === "Insufficient info") {
          refWithdrawal.current?.focus();
          setWithdrawalDenyMessage("????????? ???????????????.");
        } else if (body.message === "Password is wrong!") {
          refWithdrawal.current?.focus();
          setWithdrawalDenyMessage("??????????????? ???????????????.");
        } else if (body.message === "Expired token" || "Invalid token") {
          refWithdrawal.current?.focus();
          setWithdrawalDenyMessage("??? ????????? ??? ??????????????????.");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Navbar currentPage="/edituserinfo" />
      <Modal
        modalType={modalType}
        open={openModal}
        close={handleModalClose}
        comment={modalComment}
        handleAcceptAction={
          acceptActionType === "withdrawal"
            ? handleAcceptWithdrawal
            : acceptActionType === "edit"
            ? handleAcceptUserEditInfo
            : () => {}
        }
      />
      <div className="edit-userinfo">
        <div className="edit-userinfo__title">?????? ??????</div>
        <div className="edit-userinfo__message">
          <p>E-mail??? ????????? ??????????????????.</p>
          <p>???????????? ???????????? ?????? ???, ???????????????.</p>
        </div>
        <div className="edit-userinfo__wrapper">
          <div className="edit-userinfo__form">
            <p className="edit-userinfo__form__edit-title">?????? ??????</p>
            <ul className="edit-userinfo__form__list">
              <li className="edit-userinfo__form__item">
                <p className="edit-userinfo__form__item__label">E-mail</p>
                <input
                  className="edit-userinfo__form__item__input-email"
                  type="text"
                  placeholder={email}
                  ref={refEmail}
                  readOnly
                />
              </li>
              <li className="edit-userinfo__form__item">
                <p className="edit-userinfo__form__item__label">?????????</p>
                <input
                  className="edit-userinfo__form__item__input-nickname"
                  type="text"
                  placeholder={nickname}
                  value={inputNickname}
                  onChange={handleChangeNickname}
                  ref={refNickName}
                  onKeyPress={handleMoveTopassword}
                />
              </li>
              {googleToken.length > 1 ? (
                <></>
              ) : (
                <>
                  <li className="edit-userinfo__form__item">
                    <p className="edit-userinfo__form__item__label">
                      ??? ????????????
                    </p>
                    <input
                      className="edit-userinfo__form__item__input-password"
                      type="password"
                      placeholder="????????? ??????????????? ??????????????????."
                      value={inputPassword}
                      onChange={handleChangePassword}
                      ref={refPassword}
                      onKeyPress={handleMoveTopasswordCheck}
                    />
                  </li>
                  <li className="edit-userinfo__form__item">
                    <p className="edit-userinfo__form__item__label">
                      ???????????? ??????
                    </p>
                    <input
                      className="edit-userinfo__form__item__input-passwordcheck"
                      type="password"
                      placeholder="???????????? ??????"
                      value={inputPasswordCheck}
                      onChange={handleChangePasswordCheck}
                      ref={refPasswordCheck}
                    />
                  </li>
                </>
              )}
              <div className="edit-userinfo__form__list__deny-message">
                {editDenyMessage}
              </div>
            </ul>
            <div className="edit-userinfo__submit">
              <button
                className="edit-userinfo__submit__edit-btn"
                onClick={handleUserEditInfo}
              >
                ?????? ??????
              </button>
            </div>
          </div>
          <div className="edit-userinfo__form__withdrawal">
            <p className="edit-userinfo__form__withdrawal-title">?????? ??????</p>
            <p className="edit-userinfo__form__withdrawal-message">
              ????????? ??? ???, ????????? ??????????????????.
            </p>
            {googleToken.length > 1 ? (
              <></>
            ) : (
              <div
                className={
                  !withdrawalHidden
                    ? "edit-userinfo__form__withdrawal__form"
                    : "hidden"
                }
              >
                <p>????????????</p>
                <input
                  type="password"
                  placeholder="???????????? ??????"
                  value={inputWithdrawal}
                  onChange={handleChangeWithdrwal}
                  ref={refWithdrawal}
                />
              </div>
            )}
            <div className="edit-userinfo__form__withdrawal__submit">
              <button
                className="edit-userinfo__form__withdrawal__submit__withdrawal-btn"
                onClick={handleWithDrawal}
              >
                ?????? ??????
              </button>
            </div>
            <div className="edit-userinfo__form__withdrawal__deny-message">
              {withdrawalDenyMessage}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserInfo;
