import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "../../reducers";
import { getPlanCards, getPlanCardsByDay } from "../../actions";
import AddPlan from "./AddPlan";
import PlanTimeline from "./PlanTimeline";
import mapdata from "../../data/mapdata.json";

interface ForAddPlanProps {
  LatLng?: number[];
  setSearchLatLng?: any;
  moveKakaoMap?: any;
  planId: number | string | undefined;
  currentDay: number;
  setCurrentDay: any;
  moveToTheNextDay: () => void;
  moveToThePrevDay: () => void;
}

const PlanList = ({
  LatLng,
  setSearchLatLng,
  moveKakaoMap,
  planId,
  currentDay,
  setCurrentDay,
  moveToTheNextDay,
  moveToThePrevDay,
}: ForAddPlanProps) => {
  const dispatch = useDispatch();
  const location = useLocation() as any;
  const state = useSelector((state: RootState) => state);
  const {
    userReducer: {
      user: { token, email, nickname },
    },
    planReducer: {
      planList: { isValid, isMember, planCards },
      planCardsByDay,
    },
  } = state;
  const [openList, setOpenList] = useState<boolean>(true);
  const [inputTitle, setInputTitle] = useState<string>("");
  const [isShare, setIsShare] = useState<boolean>(true);
  const [publicToggleChecked, setPublicToggleChecked] = useState<boolean>(
    false,
  );
  const [openAddRequest, setOpenAddRequest] = useState<boolean>(false);
  const [saveBtnClicked, setSaveBtnClicked] = useState<boolean>(false);

  const [inputAddrSi, setInputAddrSi] = useState<string>("선택");
  const [inputAddrGun, setInputAddrGun] = useState<string>("선택");
  const [inputAddrGu, setInputAddrGu] = useState<string>("선택");

  const [toggleSi, setToggleSi] = useState<boolean>(false);
  const [toggleGun, setToggleGun] = useState<boolean>(false);
  const [toggleGu, setToggleGu] = useState<boolean>(false);

  const [addrList, setAddrList] = useState<any>(mapdata || {});
  const [addrListSi, setAddrListSi] = useState<string[] | undefined>();
  const [addrListGun, setAddrListGun] = useState<string[] | undefined>();
  const [addrListGu, setAddrListGu] = useState<string[] | undefined>();
  const [dayCount, setDayCount] = useState<number[]>([1]);
  const [showDayList, setShowDayList] = useState<boolean>(false);
  const [filterByDay, setFilterByDay] = useState<any>([]);
  // filterByDay = [[Day1의 일정], [Day2의 일정], [Day3의 일정], ...]
  // 초기값을 (데이터가 있을 경우) filterByDay.length = 총 Day count => setDayCount

  const refDaySlide = useRef<HTMLUListElement>(null);

  // 최초 로딩시 - 데이터 받아오기
  useEffect(() => {
    planId = Number(location.pathname.split("/")[2]);
    if (planId) {
      if (location.state) {
        const { title, representAddr } = location.state;
        setInputTitle(title);
        setInputAddrSi(representAddr.split(" ")[0]);
        setInputAddrGun(
          representAddr.split(" ")[1] ? representAddr.split(" ")[1] : "선택",
        );
        setInputAddrGu(
          representAddr.split(" ")[2] ? representAddr.split(" ")[2] : "선택",
        );
      }
      fetch(
        `${process.env.REACT_APP_SERVER_URL}/plan-cards/${planId}?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
            authorization: `Bearer ${token}`,
          },
        },
      )
        .then((res) => res.json())
        .then((body) => {
          let planCards = body.planCards.map((plan: any) => {
            return Object.assign({}, plan, {
              coordinates: plan.coordinates.coordinates,
            });
          });

          dispatch(
            getPlanCards({
              isMember: body.isMember,
              isValid: body.isValid,
              planCards,
            }),
          );
        })
        .catch((err) => console.error(err));
    } else {
      // newplan
      dispatch(
        getPlanCards({
          isMember: token.length > 0 ? true : false,
          isValid: false,
          planCards: [],
        }),
      );
    }
  }, []);

  // 최초 로딩시 - 데이터 day별로 분류하기
  useEffect(() => {
    const dayfilter = (arr: any) => {
      let result: any = [];
      let maxDay = arr.reduce(
        (acc: any, cur: any) => {
          return acc.day > cur.day ? acc : cur;
        },
        { day: 1 },
      );
      for (let i = 0; i < maxDay.day; i++) {
        result.push([]);
      }
      for (let j = 0; j < arr.length; j++) {
        if (arr[j]) {
          result[arr[j].day - 1].push(arr[j]);
        }
      }
      // console.log("값 대입", result);
      return result;
    };

    const makeDayCountArray = (arr: any) => {
      let result = [];
      for (let i = 0; i < arr.length; i++) {
        result.push(i + 1);
      }
      return result;
    };
    // Day별로 분류된 Planlist
    if (planCards) {
      const filter = dayfilter(planCards);
      // dayCount 초기값
      const initialDayCount = makeDayCountArray(filter);
      setFilterByDay(filter);
      setDayCount(initialDayCount);
      dispatch(getPlanCardsByDay(filter));
      if (currentDay > initialDayCount.length) {
        setCurrentDay(initialDayCount.length);
      }
    }
  }, [planCards]);

  useEffect(() => {
    setAddrList(mapdata);
    setAddrListSi(Object.keys(mapdata));
  }, []);

  useEffect(() => {
    if (inputAddrSi !== "선택" && addrList[inputAddrSi]) {
      setAddrListGun(Object.keys(addrList[inputAddrSi]));
    }
  }, [inputAddrSi]);

  useEffect(() => {
    if (
      inputAddrSi !== "선택" &&
      addrList[inputAddrSi] &&
      inputAddrGun !== "선택" &&
      addrList[inputAddrSi][inputAddrGun] &&
      Object.keys(addrList[inputAddrSi][inputAddrGun]).length !== 0
    ) {
      setAddrListGu(addrList[inputAddrSi][inputAddrGun]);
    }
  }, [inputAddrGun]);

  const handleOpenAddRequset = useCallback(() => {
    setOpenAddRequest(true);
  }, [openAddRequest]);

  const handleCloseAddRequest = useCallback(() => {
    setOpenAddRequest(false);
  }, [openAddRequest]);

  const handleListState = useCallback(() => {
    setOpenList(!openList);
  }, [openList]);

  const handleInputTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputTitle(e.target.value);
    },
    [inputTitle],
  );

  const handlePublicToggle = () => {
    setPublicToggleChecked(!publicToggleChecked);
  };

  const handleSavePlanBtn = () => {
    let finalPlanCards = planCardsByDay.flat();
    console.log("저장하기", finalPlanCards, isMember, isValid);
    dispatch(getPlanCards({ planCards: finalPlanCards, isMember, isValid }));
    if (!isMember) {
      // isMember === false -> 로그인창
    } else {
      // isMember === true
      if (!planId) {
        // path가 newplan -> create
        fetch(`${process.env.REACT_APP_SERVER_URL}/plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            title: inputTitle,
            public: isShare,
            representAddr:
              (inputAddrSi === "선택" ? "" : inputAddrSi) +
              " " +
              (inputAddrGun === "선택" ? "" : inputAddrGun) +
              " " +
              (inputAddrGu === "선택" ? "" : inputAddrGu),
            planCards: encodeURIComponent(JSON.stringify(finalPlanCards)),
          }),
        })
          .then((res) => res.json())
          .then((body) => {})
          .catch((err) => console.error(err));
      } else {
        // path가 planId -> 내꺼면 update, 남꺼면 create
        if (isValid) {
          // isValid === true -> update
          fetch(`${process.env.REACT_APP_SERVER_URL}/plan`, {
            method: "PATCH",
            headers: {
              authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              credentials: "include",
            },
            body: JSON.stringify({
              email,
              planId,
              title: inputTitle,
              public: isShare,
              representAddr:
                (inputAddrSi === "선택" ? "" : inputAddrSi) +
                " " +
                (inputAddrGun === "선택" ? "" : inputAddrGun) +
                " " +
                (inputAddrGu === "선택" ? "" : inputAddrGu),
              planCards: encodeURIComponent(JSON.stringify(finalPlanCards)),
            }),
          })
            .then((res) => res.json())
            .then((body) => {})
            .catch((err) => console.error(err));
        } else {
          // isValid === false -> create
          fetch(`${process.env.REACT_APP_SERVER_URL}/plan`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              credentials: "include",
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email,
              title: inputTitle,
              public: isShare,
              representAddr:
                (inputAddrSi === "선택" ? "" : inputAddrSi) +
                " " +
                (inputAddrGun === "선택" ? "" : inputAddrGun) +
                " " +
                (inputAddrGu === "선택" ? "" : inputAddrGu),
              planCards: encodeURIComponent(JSON.stringify(finalPlanCards)),
            }),
          })
            .then((res) => res.json())
            .then((body) => {
              // modal로 update 알려주기
            })
            .catch((err) => console.error(err));
        }
      }
    }
  };

  const handleInputAddrSi = (si: string): void => {
    setToggleSi(false);
    setInputAddrSi(si);
    setInputAddrGun("선택");
    setInputAddrGu("선택");
  };

  const handleInputAddrGun = (gun: string): void => {
    setToggleGun(false);
    setInputAddrGun(gun);
    setInputAddrGu("선택");
  };

  const handleInputAddrGu = (gu: string): void => {
    setToggleGu(false);
    setInputAddrGu(gu);
  };

  useEffect(() => {
    refDaySlide.current?.style.setProperty(
      "transition",
      "all 1s ease-in-out",
      "important",
    );
    refDaySlide.current?.style.setProperty(
      "transform",
      `translateX(-${currentDay - 1}00%)`,
      "important",
    );
  }, [currentDay]);

  const handleMovePrevDay = () => {
    if (currentDay !== 1) {
      moveToThePrevDay();
    }
  };

  const handleMoveNextDay = () => {
    console.log("next day");
    if (currentDay === dayCount.length) {
      // Modal로 물어보기
      let addDayCount = dayCount.concat([dayCount.length + 1]);
      setDayCount(addDayCount);
      setFilterByDay([...filterByDay].concat([[]]));
      getPlanCardsByDay(planCardsByDay.push([]));
      moveToTheNextDay();
    } else {
      moveToTheNextDay();
    }
  };

  // day는 그대로 입력하면 됨
  // ex) day 1에 그대로 1 기입 -> filterByDay[0] = Day1의 리스트들
  const handleShowPlanlistThatDay = (day: number) => {
    // console.log("어떻게 나오나?", filterByDay[day - 1]);
  };

  const handleDayList = () => {
    setShowDayList(true);
    handleShowPlanlistThatDay(1);
  };

  const handleSelectDay = (day: number) => {
    handleShowPlanlistThatDay(day + 1);
    setShowDayList(false);
  };

  console.log("planList 렌더링 planCarsByDay", planCardsByDay);
  console.log("planList 렌더링 CurrentDay", currentDay);

  // 지역 정하기 => input list 사용
  return (
    <div className="planlist">
      <AddPlan
        type="addPlan"
        open={openAddRequest}
        close={handleCloseAddRequest}
        LatLng={LatLng}
        setSearchLatLng={setSearchLatLng}
        moveKakaoMap={moveKakaoMap}
        currentDay={currentDay}
      />
      <div className="planlist__toggle" onClick={handleListState}>
        <img src="/images/prev-pink.png"></img>
      </div>
      <div className={`planlist__wrapper ${openList ? "" : "disappear"}`}>
        <div className="planlist__content">
          <div className="planlist__title">
            <input
              className="planlist__title__input"
              value={inputTitle}
              onChange={handleInputTitle}
              placeholder="제목을 입력하세요"
            />
            <p className="planlist__public-toggle__switch-text">
              {publicToggleChecked ? "🔒" : "🔓"}
            </p>
            <div className="planlist__public-toggle">
              <input
                type="checkbox"
                className="planlist__public-toggle__switch-checkbox"
                checked={publicToggleChecked}
                onChange={handlePublicToggle}
                id="switch-input"
              />
              <label
                htmlFor="switch-input"
                className="planlist__public-toggle__switch-label"
              >
                <div
                  className={`planlist__public-toggle__ball ${
                    publicToggleChecked ? "moveToRight" : ""
                  }`}
                ></div>
              </label>
            </div>
          </div>
          <span className="planlist__represent-address">
            <div className="planlist__contents__search-bar-address">
              <p>대표지역</p>
              <div className="planlist__contents__search-bar-address-all">
                <span className="planlist__contents__search-bar-address-si">
                  <p onClick={() => setToggleSi(!toggleSi)}>{inputAddrSi}</p>
                  {toggleSi ? (
                    <ul>
                      {addrListSi &&
                        addrListSi.map((si, idx) => {
                          return (
                            <li
                              key={idx}
                              value={si}
                              onClick={() => handleInputAddrSi(si)}
                            >
                              {si}
                            </li>
                          );
                        })}
                    </ul>
                  ) : (
                    <></>
                  )}
                </span>
                {inputAddrSi === "선택" ? (
                  <></>
                ) : (
                  <>
                    <h6>{">"}</h6>
                    <span className="planlist__contents__search-bar-address-gun">
                      <span onClick={() => setToggleGun(!toggleGun)}>
                        {inputAddrGun}
                      </span>
                      {toggleGun ? (
                        <ul>
                          {addrListGun &&
                            addrListGun.map((gun, idx) => {
                              return (
                                <li
                                  key={idx}
                                  value={gun}
                                  onClick={() => handleInputAddrGun(gun)}
                                >
                                  {gun}
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        <></>
                      )}
                    </span>
                  </>
                )}

                {inputAddrGun === "선택" ? (
                  <></>
                ) : (
                  <>
                    <h6>{">"}</h6>
                    <span
                      className={`planlist__contents__search-bar-address-gu`}
                    >
                      <span onClick={() => setToggleGu(!toggleGu)}>
                        {inputAddrGu}
                      </span>
                      {toggleGu ? (
                        <ul>
                          {addrListGu &&
                            addrListGu.map((gu, idx) => {
                              return (
                                <li
                                  key={idx}
                                  value={gu}
                                  onClick={() => handleInputAddrGu(gu)}
                                >
                                  {gu}
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        <></>
                      )}
                    </span>
                  </>
                )}
                {/* <button
                  className="planlist__contents__search-bar-address__reset-btn"
                  onClick={handleAddrReset}
                >
                  초기화
                </button> */}
              </div>
            </div>
          </span>
          <div className="planlist__dailyplan">
            <div className="planlist__dailyplan__top-bar">
              <button
                className="planlist__dailyplan__top-bar__prev"
                onClick={handleMovePrevDay}
              >
                {"<"}
              </button>
              <div
                className="planlist__dailyplan__top-bar__select-day"
                onClick={handleDayList}
              >
                {`Day ${dayCount[currentDay - 1]}`}
              </div>
              {showDayList ? (
                <ul className="daylist">
                  {dayCount.map((day, idx) => {
                    return (
                      <li
                        onClick={() => handleSelectDay(idx)}
                        key={idx}
                      >{`Day ${day}`}</li>
                    );
                  })}
                </ul>
              ) : (
                <></>
              )}
              <button
                className="planlist__dailyplan__top-bar__next"
                onClick={handleMoveNextDay}
              >
                {">"}
              </button>
            </div>
            <div className="planlist__dailyplan__plancards">
              <div className="planlist__dailyplan__plancards__grid">
                {Array(48)
                  .fill(true)
                  .map((grid, idx) => {
                    return (
                      <>
                        <div onClick={handleOpenAddRequset} key={idx}>
                          <span>
                            {`${Math.floor(idx / 2)}:${
                              (idx * 30) % 60 === 0 ? "00" : "30"
                            }`}
                          </span>
                        </div>
                      </>
                    );
                  })}
              </div>
              <ul className="plancards-by-day" ref={refDaySlide}>
                {dayCount.map((_, idx) => {
                  return (
                    <li className="oneday" key={idx + 1}>
                      <PlanTimeline
                        day={idx + 1}
                        saveBtnClicked={saveBtnClicked}
                        setSaveBtnClicked={setSaveBtnClicked}
                        handleSavePlanBtn={handleSavePlanBtn}
                        filterByDay={filterByDay}
                        setFilterByDay={setFilterByDay}
                        oneDayPlanList={filterByDay[idx]}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="planlist__save">
            <button
              className="planlist__save__button"
              onClick={() => {
                setSaveBtnClicked(true);
              }}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanList;
