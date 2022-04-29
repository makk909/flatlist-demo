import React, { useState, useEffect } from 'react'
import { FlatList, Image, StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native'
import { AppConstant, assignmentCancelWarning, cancelAssignmentReason, colors, dummyDescription, fonts, globalStyles, matrix, offerCancelWarning, questionClarification, reviewSuggestion, solverCancellationMessage } from '../../../assets/globalstyleconstants'
import ArrowBackSvg from '../../../assets/svgs/arrowBackSvg'
import BudgetSvg from '../../../assets/svgs/toSolve/problemDetail/budgetSvg'
import CalendarSvg from '../../../assets/svgs/toSolve/problemDetail/calendarSvg'
import ChatSvg from '../../../assets/svgs/toSolve/problemDetail/chatSvg'
import LocationSvg from '../../../assets/svgs/toSolve/problemDetail/locationSvg'
import ShareSvg from '../../../assets/svgs/toSolve/shareSvg'
import AppButton from '../../../components/appButton'
import Header from '../../../components/common/header'
import ScrollContainer from '../../../components/common/scrollcontainer'
import OfferItem from './offerItem'
import QuestionItem from './questionItem'
import QuestionItemSolver from './questionItemSolver'

import { Rating } from 'react-native-ratings';
import BulbSvg from '../../../assets/svgs/bulbSvg'

import CancelModal from '../../../components/modals/toSolve/cancelModal';
import ReactivatedModal from '../../../components/modals/toSolve/reactivatedModal';
import SuccessfullModal from '../../../components/modals/successfullModal';
import RemoveBookmarkModal from '../../../components/modals/toSolve/removeBookmarkModal';
import RequestPaymentModal from '../../../components/modals/toSolve/requestPaymentModal';
import SuccessfullModalTwo from '../../../components/modals/successfullModalTwo';
import ReviewModal from '../../../components/modals/toSolve/reviewModal';

import Loader from '../../../components/common/loader'
import { ToastMessage } from '../../../components/common/message'
import { useNetInfo } from '@react-native-community/netinfo';
import { AddReview, ClearAction, GetJob, GetOtherUserProfile, GetSolverList, GetToSolveList, JobBookmark, JobOfferCancel, JobOfferList, JobQuestionList } from '../../../redux/action'
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../redux/actiontypes';

import moment from 'moment'
import ProfileAvatarSvg from '../../../assets/svgs/profleAvatarSvg'


export default function ProblemDetailsSolver({ route, navigation }) {

    const { item, bookmark, setBookmark } = route.params
    const [tabKey, setTabKey] = useState([true, false]);

    const [isOfferModalVisible, setIsOfferModalVisible] = useState(false)
    const [isOfferCancelSuccess, setIsOfferCancelSuccess] = useState(false)
    const [isReactivatedModalVisible, setIsReactivatedModalVisible] = useState(false)
    const [isReactivatedSuccess, setIsReactivatedSuccess] = useState(false)
    const [isBookmarkModalVisible, setIsBookmarkModalVisible] = useState(false)
    const [isBookmarkSuccess, setIsBookmarkSuccess] = useState(false)
    const [isBookmarkRemovedSuccess, setIsBookmarkRemovedSuccess] = useState(false)
    const [isRequestModalVisible, setIsRequestModalVisible] = useState(false)
    const [isRequestSuccess, setIsRequestSuccess] = useState(false)
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false)
    const [isReviewSubmitSuccess, setIsReviewSubmitSuccess] = useState(false)

    const [isCancelAssignmentModalVisible, setIsCancelAssignmentModalVisible] = useState(false)
    const [isCancelAssignmentSuccess, setIsCancelAssignmentSuccess] = useState(false)

    const [dayType, setDayType] = useState('')
    const [status, setStatus] = useState('')
    const [jobDetail, setJobDetail] = useState([])
    const [jobOffers, setJobOffers] = useState([])
    const [user, setUser] = useState(null)
    const [rating, setRating] = useState('4')
    const [review, setReview] = useState('')
    const [solverName, setSolverName] = useState('')
    const [username, setUsername] = useState('')

    const [cancelReason, setCancelReason] = useState('')

    const [loading, setLoading] = useState(false)
    const state = useSelector(state => state);
    const dispatch = useDispatch()
    const netInfo = useNetInfo()

    const [problemBookmark, setProblemBookmark] = useState(bookmark)
    const [jobQuestions, setJobQuestions] = useState([])

    const QuestionHeader = () => {
        return (
            <View style={{ marginHorizontal: 16, }}>
                <AppButton
                    text="Ask a Question"
                    onPress={() => navigation.navigate('askQuestion', { jobId: item.id })}
                    // textStyle={styles.buttonText}
                    filled={true}
                />
                <View style={{ flexDirection: 'row', marginVertical: matrix.small }}>
                    <BulbSvg />
                    <Text style={{
                        marginStart: matrix.veryLittle,
                        color: colors.borderColor,
                        fontFamily: fonts.AmazonEmberRegular,
                        flex: 1
                    }}>
                        {questionClarification}
                    </Text>
                </View>
            </View>
        )
    }


    const bookmarkHandler = () => {
        console.log('bokkkmmmmaarkk');
        // if(problemBookmark){
        //     setProblemBookmark(false)
        //     setBookmark(false)
        //     // setIsBookmarkSuccess(true)
        //     setIsBookmarkRemovedSuccess(true)
        // }else{
        //     setProblemBookmark(true)
        //     setBookmark(true)
        //     setIsBookmarkSuccess(true)
        // }

        let info = {
            bookmarkInfo: {
                bookmark: !problemBookmark,
            },
            id: item.id
        }

        console.log('bookmarkInfo', info)

        {
            netInfo.isConnected ?
                (
                    setLoading(true),
                    dispatch(JobBookmark(info))
                )
                :
                ToastMessage('Network issue :(', 'Please Check Your Network !');
        }

    }

    const tabsHandler = i => {
        let tempactive = [...tabKey];

        tempactive.map((item, index) => {
            if (i === index) {
                tempactive[index] = true;
                setTabKey(tempactive);
            } else {
                tempactive[index] = false;
                setTabKey(tempactive);
            }
        });
    };

    const pictureItem = ({ item, index }) => {
        return (
            <View style={styles.pictureContainer}>
                <Image
                    source={{ uri: item.mediaURL }}
                    style={{ width: 64, height: 64, borderRadius: 2 }}
                />
            </View>
        )
    }

    const mustItem = ({ item, index }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 6 }}>{'\u2B24'}</Text>
                <Text style={{
                    marginStart: matrix.little,
                    ...globalStyles.mediumTitle
                }}>{item}</Text>
            </View>
        )
    }

    const ratingCompleted = (rating) => {
        console.log("Rating is: " + rating)
        setRating(rating)
    }

    const questionEmptyMessage = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                <Text style={{ ...globalStyles.amazonMediumBlack, }}>No Question Found For This Job</Text>
            </View>
        )
    }

    const offerEmptyMessage = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                <Text style={{ ...globalStyles.amazonMediumBlack, }}>No Offer Found For This Job</Text>
            </View>
        )
    }

    const AddReviewHandler = () => {
        if (review === '') {
            ToastMessage('Please add your review')
            return
        }
        let info = {
            jobId: item.id,
            receiverId: item.userId,
            receiverType: 'Client',
            rating: rating,
            comment: review
        }

        setLoading(true)
        dispatch(AddReview(info))
    }



    const seprator = () => {
        return (
            <View style={{ height: 20, width: '100%' }} />
        )
    }


    const getJobDetail = () => {

        let params = {
            id: item.id
        }

        // {netInfo.isConnected ?
        //     (
        //         setLoading(true),
        //         dispatch(GetJob(params))
        //     )
        //     :
        //     ToastMessage('Network issue :(', 'Please Check Your Network !');
        // }
        setLoading(true),
            dispatch(GetJob(params))

    }

    const getJobOffers = () => {

        let params = {
            id: item.id
        }

        // {netInfo.isConnected ?
        //     (
        //         setLoading(true),
        //         dispatch(GetJob(params))
        //     )
        //     :
        //     ToastMessage('Network issue :(', 'Please Check Your Network !');
        // }
        setLoading(true),
            dispatch(JobOfferList(params))

    }

    const getUserProfile = () => {

        let params = {
            id: item.userId
        }

        setLoading(true),
            dispatch(GetOtherUserProfile(params))

    }

    const cancelOffer = () => {
        if (cancelReason === '') {
            ToastMessage('Please add your reason.')
            return
        }
        setIsOfferModalVisible(false)

        let params = {
            id: item.jobOffer.id,
            info: {
                cancelReason: cancelReason
            }
        }

        setLoading(true),
            dispatch(JobOfferCancel(params))
    }

    const getJobQuestionList = () => {
        let info = {
            id: item.id
        }

        dispatch(JobQuestionList(info))
    }

    useEffect(() => {

        getJobDetail()
        getJobOffers()
        getUserProfile()
        getJobQuestionList()
        if (item.startTimeType === 'Morning') {
            setDayType('Before 10am')
        } else if (item.startTimeType === 'MidDay') {
            setDayType('10am - 2pm')
        } else if (item.startTimeType === 'Afternoon') {
            setDayType('2pm - 6pm')
        } else if (item.startTimeType === 'Evening') {
            setDayType('After 6pm')
        }
        // setStatus(item.status)
        setSolverName(state.user_profile.name)
        if (item.jobOffer && item.jobOffer.status === 'Pending' && !item.solverReview) {
            setStatus('Offered')
        } else if (item.solverReview) {
            setStatus('Reviewed')
        } else {
            setStatus(item.status)  // item.status
        }

    }, [])

    useEffect(() => {
        console.log('job detail LOGS...', state)

        if (state.case === actions.GET_JOB_SUCCESS) {
            setJobDetail(state.job_detail.job)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_JOB_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_JOB_OFFER_LIST_SUCCESS) {
            setJobOffers(state.job_offers_list.list)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_JOB_OFFER_LIST_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_OTHER_USER_PROFILE_SUCCESS) {
            setUser(state.other_user_profile.user)
            setUsername(state.other_user_profile.user.name)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_OTHER_USER_PROFILE_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.JOB_OFFER_CANCEL_SUCCESS) {
            // setJobOffers(state.job_offers_list.list)
            setStatus('Open') // changes need to be done here for assigned
            // setIsOfferModalVisible(false)
            dispatch(GetSolverList(AppConstant.paramsSolver))
            setIsOfferCancelSuccess(true)
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.JOB_OFFER_CANCEL_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.JOB_BOOKMARK_SUCCESS) {
            // setIsOfferCancelSuccess(true)
            if (problemBookmark) {
                setProblemBookmark(false)
                setBookmark(false)
                // setIsBookmarkSuccess(true)
                setIsBookmarkRemovedSuccess(true)
            } else {
                setProblemBookmark(true)
                setBookmark(true)
                setIsBookmarkSuccess(true)
            }
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.JOB_BOOKMARK_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.JOB_QUESTION_LIST_SUCCESS) {
            setJobQuestions(state.job_question_list)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.JOB_QUESTION_LIST_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.ADD_REVIEW_SUCCESS) {
            // setJobQuestions()
            setStatus('Reviewed')
            dispatch(GetSolverList(AppConstant.paramsSolver))
            setLoading(false)
            setReview('')
            ToastMessage(state.message)
            // setIsReviewSubmitSuccess(true)
            dispatch(ClearAction())
        }
        else if (state.case === actions.ADD_REVIEW_FAILURE) {
            ToastMessage(state.message)
            setLoading(false)
            dispatch(ClearAction())
        }

    }, [state])

    // console.log('jobDetails--', user);
    console.log('jobOffers--', jobOffers);

    return (
        <View style={globalStyles.container}>
            <Loader visible={loading} />
            <Header
                title="Problem Details"
                onPress={() => navigation.goBack()}
                leftSvg={<ArrowBackSvg />}
                rightSvg={<ShareSvg fill='#000' />}
            // onRightPress={()=>deleteHandler()}
            />
            <ScrollContainer>
                <View style={globalStyles.insideContainer}>
                    <View style={{ alignItems: 'center' }}>
                        {status === 'Open' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.open
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.white
                                }}>Status: OPEN
                            </Text>
                            </View>
                        }
                        {status === 'Assigned' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.assigned
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.black
                                }}>Status: ASSIGNED
                            </Text>
                            </View>
                        }
                        {status === 'Offered' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.offered
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.white
                                }}>Status: OFFERED
                            </Text>
                            </View>
                        }
                        {status === 'Solved' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.black
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.white
                                }}>Status: SOLVED
                            </Text>
                            </View>
                        }
                        {status === 'Reviewed' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.lightGray
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.black
                                }}>Status: REVIEWED
                            </Text>
                            </View>
                        }
                        {status === 'Cancelled' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.lightGray
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.black
                                }}>Status: CANCELED
                            </Text>
                            </View>
                        }
                        {status === 'Pay' &&
                            <View style={{
                                ...styles.statusHeader,
                                backgroundColor: colors.pay
                            }}>
                                <Text style={{
                                    ...globalStyles.amazonRegularBlack,
                                    // marginTop:matrix.small,
                                    color: colors.black
                                }}>Status: PAYMENT REQUESTED
                            </Text>
                            </View>
                        }
                        <Text style={{
                            ...globalStyles.amazonRegularBlack,
                            marginTop: matrix.small,
                            color: colors.textGray
                        }}>Problem No. {item.id}
                        </Text>
                    </View>
                    <Text style={{
                        ...globalStyles.amazonRegularBlack,
                        marginTop: matrix.doubleLarge,
                        fontSize: 22
                    }}>{jobDetail.title}</Text>
                    <View>
                        <View style={styles.infoContainer}>
                            {item.user && item.user.profilePicURL === '' ?
                                <ProfileAvatarSvg />
                                :
                                <Image
                                    source={{ uri: item.user.profilePicURL }}
                                    style={{ height: 48, width: 48, borderRadius: 24 }}
                                />
                            }
                            {/* <ProfileAvatarSvg /> */}
                            {user &&
                                <View style={{ marginStart: matrix.medium }}>
                                    <Text style={{ ...globalStyles.amazonRegularBlack }}>{user.name}</Text>
                                    <Text style={{ color: colors.textGray }}>Posted {moment
                                        .utc(user?.lastSeen)
                                        .local()
                                        .startOf('seconds')
                                        .fromNow()}</Text>
                                </View>
                            }
                        </View>
                        <View style={styles.infoContainer}>
                            <LocationSvg />
                            <View style={styles.info}>
                                {jobDetail.pickup &&
                                    <Text style={{ ...globalStyles.amazonRegularBlack }}>{jobDetail.pickup.formatted}</Text>
                                }
                                <Text style={{ color: colors.secondary, ...globalStyles.amazonRegularBlack }}>View map</Text>
                            </View>
                        </View>
                        <View style={styles.infoContainer}>
                            <CalendarSvg />
                            <View style={styles.info}>
                                <Text style={{ ...globalStyles.amazonRegularBlack }}>{jobDetail.startDate}</Text>
                                <Text style={{ ...globalStyles.amazonRegularBlack }}>{jobDetail.startTimeType} ({dayType})</Text>
                            </View>
                        </View>
                        <View style={styles.infoContainer}>
                            <BudgetSvg />
                            <View style={styles.info}>
                                <Text style={{ ...globalStyles.amazonMediumBlack, fontSize: 30 }}>RM{jobDetail.budget}</Text>
                                <Text style={{ color: colors.textGray }}>Budget</Text>
                            </View>
                        </View>
                    </View>
                    {status === 'Open' &&
                        <>
                            <View style={styles.statusContainer}>
                                <Text style={{
                                    textAlign: 'center',
                                    ...globalStyles.amazonRegularBlack
                                }}>Get paid to solve the problem. What’s your offer price?</Text>
                                <View style={{ marginTop: 8 }}>
                                    <AppButton
                                        text="Make an offer"
                                        textStyle={styles.buttonText}
                                        onPress={() => navigation.navigate('makeOffer', { jobDetail: jobDetail })}
                                        filled={true}
                                    />
                                </View>
                                <View style={{ marginTop: 8 }}>
                                    <AppButton
                                        text={problemBookmark ? 'Remove Bookmark' : 'Bookmark'}
                                        textStyle={styles.buttonText}
                                        onPress={bookmarkHandler}
                                        filled={true}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: matrix.little }}>
                                    <BulbSvg />
                                    <Text style={{
                                        marginStart: matrix.veryLittle,
                                        color: colors.borderColor,
                                        fontFamily: fonts.AmazonEmberRegular,
                                        flex: 1
                                    }}>
                                        {solverCancellationMessage}</Text>
                                </View>
                            </View>
                        </>
                    }
                    {status === 'Assigned' &&
                        <>
                            <View style={styles.statusContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    <Pressable style={{ flexDirection: 'row', }}>
                                        <Text style={{
                                            ...globalStyles.amazonRegularBlack,
                                            color: colors.secondary
                                        }}>Chat with Client</Text>
                                        <ChatSvg style={{ marginHorizontal: 4 }} />
                                    </Pressable>
                                    {item.jobOffer &&
                                        <Text style={{
                                            ...globalStyles.amazonMediumBlack,
                                            marginTop: matrix.little,
                                            fontSize: 30
                                        }}>RM{item.jobOffer.offerPrice}</Text>
                                    }
                                    <Text style={styles.priceLabel}>Agreed Price</Text>
                                </View>
                                <View>
                                    <AppButton
                                        text="Cancel"
                                        textStyle={styles.buttonText}
                                        onPress={() => setIsCancelAssignmentModalVisible(true)}
                                        filled={true}
                                    />
                                </View>
                                <View style={{ marginTop: 8 }}>
                                    <AppButton
                                        text="Request Payment"
                                        textStyle={styles.buttonText}
                                        onPress={() => setIsRequestModalVisible(true)}
                                        filled={true}
                                    />
                                </View>
                            </View>
                        </>
                    }
                    {status === 'Offered' &&
                        <>
                            <View style={styles.statusContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ ...globalStyles.amazonMediumBlack, }}>You’ve submitted an offer</Text>
                                    {item.jobOffer &&
                                        <Text style={{
                                            ...globalStyles.amazonMediumBlack,
                                            marginTop: matrix.little,
                                            fontSize: 30
                                        }}>RM{item.jobOffer.offerPrice}</Text>
                                    }
                                    <Text style={styles.priceLabel}>Your offer Price</Text>
                                </View>
                                <View>
                                    <AppButton
                                        text="Change Price"
                                        textStyle={styles.buttonText}
                                        onPress={() => navigation.navigate('changeOffer', { offerDetail: item.jobOffer })}
                                        filled={true}
                                    />
                                </View>
                                <View style={{ marginTop: 8 }}>
                                    <AppButton
                                        text="Cancel"
                                        textStyle={styles.buttonText}
                                        onPress={() => setIsOfferModalVisible(true)}
                                        filled={true}
                                    />
                                </View>
                            </View>
                        </>
                    }
                    {status === 'Cancelled' &&
                        <>
                            <View style={styles.statusContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    {item.jobOffer &&
                                        <Text style={{
                                            ...globalStyles.amazonMediumBlack,
                                            fontSize: 30
                                        }}>RM{item.jobOffer.offerPrice}</Text>
                                    }
                                    <Text style={styles.priceLabel}>Offered Price</Text>
                                </View>
                                <View>
                                    <AppButton
                                        text="Reactivate offer"
                                        onPress={() => setIsReactivatedModalVisible(true)}
                                        textStyle={styles.buttonText}
                                        filled={true}
                                    />
                                </View>
                            </View>
                        </>
                    }
                    {status === 'Solved' &&
                        <>
                            <View style={styles.statusContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    {item.jobOffer &&
                                        <Text style={{
                                            ...globalStyles.amazonMediumBlack,
                                            fontSize: 30
                                        }}>RM{item.jobOffer.offerPrice}</Text>
                                    }
                                    <Text style={styles.priceLabel}>Transaction Price</Text>
                                </View>
                                <View>
                                    <AppButton
                                        text="Write a review"
                                        onPress={() => setIsReviewModalVisible(true)}
                                        textStyle={styles.buttonText}
                                        filled={true}
                                    />
                                </View>
                            </View>
                        </>
                    }
                    {status === 'Reviewed' &&
                        <>
                            <View style={styles.statusContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    {item.jobOffer &&
                                        <Text style={{
                                            ...globalStyles.amazonMediumBlack,
                                            fontSize: 30
                                        }}>RM{item.jobOffer.offerPrice}</Text>
                                    }
                                    <Text style={styles.priceLabel}>Transaction Price</Text>
                                </View>
                            </View>
                            {item.solverReview &&
                                <View style={{ ...styles.statusContainer, marginTop: 0 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{
                                            ...globalStyles.amazonRegularBlack,
                                            fontSize: 20
                                        }}>{solverName} review for {username}.
                                </Text>
                                        <Rating
                                            startingValue={item.solverReview.rating}
                                            ratingCount={5}
                                            readonly
                                            isDisabled={true}
                                            imageSize={20}
                                            showRating={false}
                                            // onFinishRating={ratingCompleted}
                                            style={{ marginVertical: 12 }}
                                        />
                                        <Text style={{
                                            ...globalStyles.amazonRegularBlack,
                                            textAlign: 'center'
                                        }}>{item.solverReview.comment}
                                        </Text>
                                    </View>
                                </View>
                            }
                            {item.clientReview &&
                                <View style={{ ...styles.statusContainer, marginTop: 0 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{
                                            ...globalStyles.amazonRegularBlack,
                                            fontSize: 20
                                        }}>{username} review for {solverName}.
                                </Text>
                                        <Rating
                                            startingValue={item.clientReview.rating}
                                            ratingCount={5}
                                            readonly
                                            isDisabled={true}
                                            imageSize={20}
                                            showRating={false}
                                            // onFinishRating={ratingCompleted}
                                            style={{ marginVertical: 12 }}
                                        />
                                        <Text style={{
                                            ...globalStyles.amazonRegularBlack,
                                            textAlign: 'center'
                                        }}>{item.clientReview.comment}
                                        </Text>
                                    </View>
                                </View>
                            }
                        </>
                    }
                    {status === 'Pay' &&
                        <>
                            <View style={styles.statusContainer}>
                                <View style={{ alignItems: 'center' }}>
                                    <Pressable style={{ flexDirection: 'row', }}>
                                        <Text style={{
                                            ...globalStyles.amazonRegularBlack,
                                            color: colors.secondary
                                        }}>Chat with Client</Text>
                                        <ChatSvg style={{ marginHorizontal: 4 }} />
                                    </Pressable>
                                    <Text style={{
                                        ...globalStyles.amazonMediumBlack,
                                        marginTop: matrix.little,
                                        fontSize: 30
                                    }}>RM849</Text>
                                    <Text style={styles.priceLabel}>Agreed Price</Text>
                                </View>
                            </View>
                        </>
                    }
                    <View>
                        <Text style={styles.greyTitle}>Description</Text>
                        <Text style={{ ...globalStyles.amazonRegularBlack }}>{jobDetail.description}</Text>
                    </View>
                    <View style={{ marginTop: matrix.doubleLarge }}>
                        <Text style={styles.greyTitle}>Must-haves</Text>
                        {jobDetail.mustHave &&
                            <FlatList
                                data={jobDetail.mustHave}
                                keyExtractor={(item, index) => index}
                                renderItem={mustItem}
                            />
                        }
                    </View>
                    <View style={{ marginTop: matrix.doubleLarge }}>
                        <Text style={styles.greyTitle}>Pictures</Text>
                        {jobDetail.medias &&
                            <FlatList
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                data={jobDetail.medias}
                                keyExtractor={(item, index) => index}
                                renderItem={pictureItem}
                            />
                        }
                    </View>
                </View>
                <View style={{ ...styles.seprator, marginBottom: 0 }} />
                <View style={{
                    flexDirection: 'row',
                }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                        }}
                        onPress={() => tabsHandler(0)}>
                        <View style={{
                            ...globalStyles.tabView,
                            alignItems: 'center',
                            marginEnd: 12,
                            borderBottomWidth: tabKey[0] ? 2 : 0
                        }}>
                            <Text style={{
                                ...globalStyles.tabLabel,
                                color: tabKey[0] ? colors.black : colors.secondary
                            }}>OFFERS</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                        }}
                        onPress={() => tabsHandler(1)}>
                        <View style={{
                            ...globalStyles.tabView,
                            marginStart: 12,
                            alignItems: 'center',
                            borderBottomWidth: tabKey[1] ? 2 : 0,
                        }}>
                            <Text style={{
                                ...globalStyles.tabLabel,
                                color: tabKey[1] ? colors.black : colors.secondary
                            }}>QUESTIONS</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {tabKey[0] ?
                    <FlatList
                        data={jobOffers}
                        keyExtractor={(item, index) => index}
                        renderItem={OfferItem}
                        ItemSeparatorComponent={seprator}
                        style={{ paddingVertical: 24 }}
                        ListEmptyComponent={offerEmptyMessage}
                    />
                    :
                    <FlatList
                        data={jobQuestions.list}
                        keyExtractor={(item, index) => index}
                        renderItem={QuestionItemSolver}
                        ItemSeparatorComponent={seprator}
                        style={{ paddingVertical: 24 }}
                        ListHeaderComponent={status === 'Open' || status === 'Offered' ? QuestionHeader : null}
                        ListEmptyComponent={questionEmptyMessage}
                    />
                }

            </ScrollContainer>
            <CancelModal
                isModalVisible={isOfferModalVisible}
                setIsModalVisible={setIsOfferModalVisible}
                title="Cancel Offer"
                cancelReason={'Let us know why you would like to cancel the offer.'}
                cancelWarning={offerCancelWarning}
                // setIsSuccessModalVisible={setIsOfferSuccess}
                onPress={cancelOffer}
                value={cancelReason}
                setValue={setCancelReason}
            />
            <SuccessfullModal
                title={'Offer cancelled'}
                text={'Your offer has been cancelled.'}
                isModalVisible={isOfferCancelSuccess}
                setIsModalVisible={setIsOfferCancelSuccess}
                onPress={() => setIsOfferCancelSuccess(false)}
            />
            <ReactivatedModal
                isModalVisible={isReactivatedModalVisible}
                setIsModalVisible={setIsReactivatedModalVisible}
                setIsSuccessModalVisible={setIsReactivatedSuccess}
            />
            <SuccessfullModal
                title={'Offer reactivated'}
                text={'Your offer has been reactivated'}
                isModalVisible={isReactivatedSuccess}
                setIsModalVisible={setIsReactivatedSuccess}
                onPress={() => setIsReactivatedSuccess(false)}
            />
            {/* <RemoveBookmarkModal
                isModalVisible={isBookmarkModalVisible}
                setIsModalVisible={setIsBookmarkModalVisible}
                setIsSuccessModalVisible={setIsBookmarkSuccess}
            /> */}
            <SuccessfullModal
                title={'Bookmark removed'}
                text={'This problem is no longer on your To-Solve list.'}
                isModalVisible={isBookmarkRemovedSuccess}
                setIsModalVisible={setIsBookmarkRemovedSuccess}
                onPress={() => setIsBookmarkRemovedSuccess(false)}
            />
            <SuccessfullModal
                title={'Problem bookmarked'}
                text={'This problem is now on your To-Solve list.'}
                isModalVisible={isBookmarkSuccess}
                setIsModalVisible={setIsBookmarkSuccess}
                onPress={() => {
                    setIsBookmarkSuccess(false),
                        console.log('hjkhkjhjkhjhjk')
                }
                }
            />
            <RequestPaymentModal
                isModalVisible={isRequestModalVisible}
                setIsModalVisible={setIsRequestModalVisible}
                setIsSuccessModalVisible={setIsRequestSuccess}
            />
            <SuccessfullModalTwo
                title={'Payment Request submitted'}
                messageOne={'What’s next? Wait for client to confirm that the problem has been solved.'}
                messageTwo={'If the client does not confirm within 24 hours, we will contact the client.'}
                isModalVisible={isRequestSuccess}
                setIsModalVisible={setIsRequestSuccess}
                onPress={() => setIsRequestSuccess(false)}
            />
            <ReviewModal
                isModalVisible={isReviewModalVisible}
                setIsModalVisible={setIsReviewModalVisible}
                title="Write a review"
                reviewSuggestion={reviewSuggestion}
                setIsSuccessModalVisible={setIsReviewSubmitSuccess}
                ratingCompleted={ratingCompleted}
                onPress={AddReviewHandler}
                value={review}
                setValue={setReview}
                rating={rating}
            />
            <SuccessfullModal
                title={'Review submitted'}
                text={'Thank you for submitting your review.'}
                isModalVisible={isReviewSubmitSuccess}
                setIsModalVisible={setIsReviewSubmitSuccess}
                onPress={() => setIsReviewSubmitSuccess(false)}
            />
            <CancelModal
                isModalVisible={isCancelAssignmentModalVisible}
                setIsModalVisible={setIsCancelAssignmentModalVisible}
                title="Cancel assignment"
                cancelReason={cancelAssignmentReason}
                cancelWarning={assignmentCancelWarning}
                setIsSuccessModalVisible={setIsCancelAssignmentSuccess}
                onPress={cancelOffer}
                value={cancelReason}
                setValue={setCancelReason}
            />
            <SuccessfullModal
                title={'Assignment cancelled'}
                text={'The assignment has been cancelled.'}
                isModalVisible={isCancelAssignmentSuccess}
                setIsModalVisible={setIsCancelAssignmentSuccess}
                onPress={() => setIsCancelAssignmentSuccess(false)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: matrix.large,

    },
    info: {
        flex: 1,
        marginStart: matrix.medium
    },
    seprator: {
        borderWidth: 1,
        width: '100%',
        borderColor: colors.secondary,
        backgroundColor: colors.secondary,
        marginVertical: matrix.doubleExtraLarge
    },
    greyTitle: {
        color: colors.textGray, marginBottom: matrix.little
    },
    pictureContainer: {
        flex: 1,
        borderRadius: 4,
        borderColor: colors.secondary,
        borderWidth: 2,
        marginEnd: 8
    },
    statusHeader: {
        paddingHorizontal: matrix.small,
        paddingVertical: 6,
        marginTop: matrix.doubleLarge,
        borderRadius: 4
    },
    statusContainer: {
        marginVertical: matrix.doubleExtraLarge,
        padding: matrix.large,
        borderColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 6
    },
    priceLabel: {
        color: colors.textGray,
        fontSize: 10,
        marginBottom: 4
    },
    buttonText: {
        // color:'#fff',
        color: colors.black,
        // fontWeight:'bold',
        fontFamily: fonts.AmazonEmberMedium,
        fontSize: matrix.large,
    },

})
