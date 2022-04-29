import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Image, FlatList, Alert, Linking, Platform, PermissionsAndroid } from 'react-native'
import { colors, fonts, matrix, SCREEN_HEIGHT, SCREEN_WIDTH, AppConstant, videos } from '../../../assets/globalstyleconstants'
import DropDownSvg from '../../../assets/svgs/dropDownSvg'
import MarkerSvg from '../../../assets/svgs/markerSvg'
import NotificationIconSvg from '../../../assets/svgs/notificationIconSvg'

import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image'
import ScrollContainer from '../../../components/common/scrollcontainer'
import GooglePlacesModal from '../../../components/modals/googlePlacesModal'
import i18n, { changeLanguage, strings } from '../../../translation/i18n'
import Loader from '../../../components/common/loader'
import LanguagePicker from '../../../components/modals/languagePicker'
import { LANGUAGES } from '../../../translation/languages'

import { useNetInfo } from '@react-native-community/netinfo';
import { SignIn, ClearAction, GetLanguages, GetCategories, AppSettings, GetUserProfile } from '../../../redux/action'
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../redux/actiontypes';
import { setData } from '../../../config/storage'

import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher'
// import Geolocation from '@react-native-community/geolocation'
import Geolocation from 'react-native-geolocation-service';
import { googleMapsApiKey } from '../../../config/utils';

import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Home(props) {

    const [isGooglePlaces, setIsGooglePlaces] = useState(false)
    const [categories, setCategories] = useState([])
    const [languages, setLanguages] = useState([])
    // const [location, setLocation] = useState('Enter Location')
    const [user, setUser] = useState('')
    const [address, setAddress] = useState({
        formatted: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    })

    const [lat, setLat] = useState('')
    const [long, setLong] = useState('')
    const [chooseOption, setChooseOption] = useState('en')
    const [loading, setLoading] = useState(false)
    const state = useSelector(state => state);
    const dispatch = useDispatch()
    const netInfo = useNetInfo()

    const getOneTimeLocation = async () => {

        // function
        if (Platform.OS === 'ios') {

            Geolocation.requestAuthorization('whenInUse')
                .then((result) => {
                    if (result === 'granted') {
                        // success case
                        console.log('PERMISSION', result);
                        Geolocation.getCurrentPosition(
                            info => {
                                console.log('firsrt lat long', info);
                                setData('LAT', JSON.stringify(info.coords.latitude))
                                setData('LONG', JSON.stringify(info.coords.longitude))
                                AppConstant.lat = info.coords.latitude
                                AppConstant.long = info.coords.longitude
                                fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + info.coords.latitude + ',' + info.coords.longitude + '&key=' + googleMapsApiKey)
                                    .then((response) => response.json())
                                    .then((responseJson) => {
                                        console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson.results[0].formatted_address));
                                        setAddress({ ...address, formatted: responseJson.results[0].formatted_address })
                                    })

                            },
                            error => {
                                console.log(error.message);
                            },
                            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
                        );
                    }
                })
                .catch((error) => console.log(error));
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Device current location permission',
                        message:
                            'Allow app to get your current location',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                console.log('GRANTED ANDROID', granted);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    //   this.getCurrentLocation();
                    Geolocation.getCurrentPosition(
                        info => {
                            console.log('firsrt lat long', info);
                            setData('LAT', JSON.stringify(info.coords.latitude))
                            setData('LONG', JSON.stringify(info.coords.longitude))
                            AppConstant.lat = info.coords.latitude
                            AppConstant.long = info.coords.longitude
                            fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + info.coords.latitude + ',' + info.coords.longitude + '&key=' + googleMapsApiKey)
                                .then((response) => response.json())
                                .then((responseJson) => {
                                    console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson.results[0].formatted_address));
                                    setAddress({ ...address, formatted: responseJson.results[0].formatted_address })
                                })

                        },
                        error => {
                            console.log(error.message);
                        },
                        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
                    );
                } else {
                    console.log('Location permission denied');
                }
            } catch (err) {
                console.warn(err);
            }


        }
        // setLoading(true);

    };

    useEffect(() => {
        getOneTimeLocation()
        console.log('app constsss', AppConstant);
    }, [])

    const openAppSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:')
        } else {
            IntentLauncher.startActivity({
                action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
                data: 'package:' + pkg
            })
        }
    }

    const languageHandler = () => {
        setLoading(true)
        changeLanguage('hn')
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }

    useEffect(() => {
        setLoading(true)
        dispatch(AppSettings())
        dispatch(GetCategories())
        dispatch(GetLanguages())
        dispatch(GetUserProfile())
    }, [])

    useEffect(() => {
        console.log('Home LOGS...', state)

        if (state.case === actions.GET_CATEGORIES_SUCCESS) {
            // setCategories(state.categories.data.list)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_CATEGORIES_FAILURE) {
            setLoading(false)
            dispatch(ClearAction())
        }
        // else if (state.case === actions.GET_LANGUAGES_SUCCESS) {
        //     setLanguages(state.languages.data.languages)
        //     setLoading(false)
        //     dispatch(ClearAction())
        // } else if (state.case === actions.GET_LANGUAGES_FAILURE) {
        //     setLoading(false)
        //     dispatch(ClearAction())
        // } 
        else if (state.case === actions.APP_SETTINGS_SUCCESS) {
            setLanguages(state.app_settings.languages)
            setCategories(state.app_settings.categories)
            setData('CATEGORIES', JSON.stringify(state.app_settings.categories))
            setData('LANGUAGES', JSON.stringify(state.app_settings.languages))
            setLoading(false)
            dispatch(ClearAction())
        } else if (state.case === actions.APP_SETTINGS_FAILURE) {
            console.log('app settings FAILED...', state.message)
            setLoading(false)
            dispatch(ClearAction())
        }
        else if (state.case === actions.GET_USER_PROFILE_SUCCESS) {
            // setLanguages(state.languages.data.languages)
            AppConstant.user = state.user_profile
            setUser(state.user_profile.name)
            setLoading(false)
            dispatch(ClearAction())
        } else if (state.case === actions.GET_USER_PROFILE_FAILURE) {
            setLoading(false)
            AsyncStorage.removeItem('userToken')
            props.navigation.replace('Auth')
            dispatch(ClearAction())
        }

    }, [state])

    const videoItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{
                    ...styles.videoItem,
                    marginStart: index === 0 ? 16 : 0,
                }}
                onPress={() => props.navigation.navigate('watchVideo')}
            >
                <Image
                    source={require('../../../assets/images/image.png')}
                    style={styles.bannerImage}
                />
                <View>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagLabel}>FREE</Text>
                    </View>
                    <View style={{
                        paddingHorizontal: matrix.large,
                        paddingBottom: matrix.large,
                        marginTop: 4
                    }}>
                        <Text style={{
                            fontFamily: fonts.AmazonEmberMedium,
                            color: colors.black
                        }}>{item.title}</Text>
                        <Text style={{
                            fontFamily: fonts.AmazonEmberRegular,
                            color: colors.black
                        }}>{item.desc}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const problemItem = ({ item }) => {
        // console.log('item',item);
        return (
            <TouchableOpacity style={{
                alignItems: 'center',
                // marginEnd:matrix.large,
                marginBottom: matrix.medium,
                flex: 1
            }}
                onPress={() =>
                    props.navigation.navigate('postProblem', { item: item })
                }
            >
                <View style={{ flex: 1 }}>
                    <Image
                        source={{ uri: item.mediaURL }}
                        style={{ width: 66, height: 60 }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontFamily: fonts.AmazonEmberRegular,
                        textAlign: 'center',
                        color: colors.black,
                        // marginHorizontal:12
                        // width:66,
                        // alignItems:'center'
                    }}
                        ellipsizeMode='tail'
                    >{item.categoryLanguages[0].name}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.container}>
            <Loader visible={loading} />
            <View style={{ height: SCREEN_HEIGHT / 8 }}>
                <ImageBackground
                    style={styles.mainContainer}
                    source={require('../../../assets/images/header.png')}
                >
                    <View style={styles.insideContainer}>
                        <TouchableOpacity
                            // onPress={onPress} 
                            style={styles.notificationContainer}
                        >
                            <NotificationIconSvg />
                            <Text style={styles.notificationNum}>1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => setIsGooglePlaces(true)}
                        >
                            <MarkerSvg />
                            {address.formatted === '' ?
                                <>
                                    <Text
                                        style={styles.title}
                                        numberOfLines={1}
                                        ellipsizeMode='tail'>{strings.enterLocation}</Text>
                                    <DropDownSvg />
                                </>
                                :
                                <>
                                    <Text
                                        style={styles.title}
                                        numberOfLines={1}
                                        ellipsizeMode='tail'>{address.formatted}</Text>
                                    <DropDownSvg />
                                </>
                            }
                        </TouchableOpacity>
                        {/* <TouchableOpacity 
                        style={styles.languageContainer}
                        onPress={()=>languageHandler()}
                        >
                        <Text style={styles.language}>En</Text>
                        <DropDownSvg/>
                    </TouchableOpacity> */}
                        <LanguagePicker
                            OPTIONS={languages}
                            chooseOption={chooseOption}
                            setChooseOption={setChooseOption}
                        />
                    </View>
                </ImageBackground>
            </View>
            <ScrollContainer style={{}}>

                <View style={styles.introduce}>
                    {AppConstant.user &&
                        <Text style={styles.name}>Hello {AppConstant.user.name}</Text>
                    }
                    <Text style={styles.problemDescriptionLabel}>{strings.solveProblems}</Text>
                </View>
                <FlatList
                    horizontal
                    data={videos}
                    renderItem={videoItem}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                />
                <View style={styles.problemsContainer}>
                    <View>
                        <Text style={styles.getOffersLabel}>
                            {strings.postProblem}</Text>
                        <Text style={styles.postProblemMessageLabel}>
                            {strings.helpAround}</Text>
                    </View>
                    <FlatList
                        data={categories}
                        renderItem={problemItem}
                        keyExtractor={(item, index) => item.id}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        numColumns={4}
                        style={styles.problemList}
                    />
                </View>
            </ScrollContainer>
            <GooglePlacesModal
                isModalVisible={isGooglePlaces}
                setIsModalVisible={setIsGooglePlaces}
                onPress={() => setIsGooglePlaces(false)}
                setLocation={setAddress}
                location={address}
                setLat={setLat}
                setLong={setLong}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        // backgroundColor:colors.primary
    },
    insideContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: matrix.extraLarge,
        marginVertical: matrix.large,
    },
    title: {
        fontSize: matrix.large,
        marginHorizontal: matrix.little,
        marginVertical: 2,
        color: colors.black,
        // fontWeight:'bold',
        fontFamily: fonts.AmazonEmberMedium,
        width: 128
        // fontFamily:fonts.futuraPTHeavy
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    introduce: {
        marginVertical: matrix.doubleExtraLarge,
        marginHorizontal: matrix.large
    },
    name: {
        fontSize: matrix.extraLarge,
        // fontWeight:'bold'
        fontFamily: fonts.AmazonEmberMedium,
        color: colors.black
    },
    videoItem: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.34,
        shadowRadius: 4.32,
        elevation: 2,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginEnd: matrix.large,
        width: 216,
        marginVertical: matrix.verySmall
        // borderWidth:1,
        // overflow:'hidden'
        // flex:1
    },
    notificationContainer: {
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    notificationNum: {
        marginHorizontal: matrix.tooLittle,
        fontFamily: fonts.AmazonEmberMedium,
        color: colors.black
    },
    // languageContainer:{
    //     flexDirection:'row',
    //     alignItems:'center'
    // },
    // language:{
    //     fontFamily:fonts.AmazonEmberMedium,
    //     color:colors.black
    // },
    problemDescriptionLabel: {
        fontSize: matrix.large,
        marginTop: 4,
        color: colors.black,
        fontFamily: fonts.AmazonEmberRegular
    },
    problemsContainer: {
        marginHorizontal: matrix.large,
        marginTop: matrix.medium
    },
    getOffersLabel: {
        // fontWeight:'bold',
        fontSize: matrix.extraLarge,
        fontFamily: fonts.AmazonEmberMedium,
        color: colors.black
    },
    postProblemMessageLabel: {
        fontSize: matrix.large,
        fontFamily: fonts.AmazonEmberMedium,
        color: colors.black
    },
    problemList: {
        marginVertical: matrix.doubleExtraLarge,
        flex: 1
    },
    bannerImage: {
        width: '100%',
        // height:132,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        // flex:1
    },
    tagContainer: {
        backgroundColor: colors.primary,
        alignSelf: 'baseline',
        marginStart: matrix.large,
        paddingHorizontal: matrix.veryLarge,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: -12
    },
    tagLabel: {
        fontFamily: fonts.AmazonEmberMedium,
        color: colors.black,
    }
})
