import React, { useState, useEffect } from 'react';
import NavigateSidebar from '../Sidebar/NavigateSidebar';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EditProfileForm from './EditProfileModal';
import Footer from '../../Footer/footer';
import { getRoleCounts } from '../../../config/rolecount-config';

const Analytics = () => {
    const [userInfo, setUserInfo] = useState({
        userName: null,
        userRole: null,
        phone: null,
        address: null,
        firstName: null,
        lastName: null,
    });

    const [userId, setUserId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [foodInfo, setFoodInfo] = useState({
        donatedWeight: 0,
        receivedWeight: 0,
        deliveredWeight: 0,
        totalFoodItemsDonated: 0,
        totalFoodItemsReceived: 0,
        totalFoodItemsDelivered: 0,
        foodTypeCounts: Array(7).fill(0),
    });
    const [counts, setCounts] = useState([]);
    const [labelText, setLabelText] = useState("");

    useEffect(() => {
        getRoleCounts((countsArray) => {
            console.log('Received Counts Array:', countsArray);
            setCounts(countsArray);
        });
    }, []);


    const fetchDonationData = () => {
        const db = getDatabase();
        const donationRef = ref(db, 'donationRequests');

        onValue(donationRef, (snapshot) => {
            const donationData = snapshot.val();
            let donatedWeight = 0;
            let receivedWeight = 0;
            let deliveredWeight = 0;
            let totalFoodItemsDonated = 0;
            let totalFoodItemsReceived = 0;
            let totalFoodItemsDelivered = 0;
            const foodTypeCounts = Array(7).fill(0);

            if (donationData) {
                console.log(donationData);
                Object.values(donationData).forEach((request) => {
                    if (request.userId === userId) {
                        donatedWeight += parseFloat(request.foodWeight) || 0;
                        totalFoodItemsDonated += parseInt(request.foodQuantity) || 0;
                        updateFoodTypeCounts(request, foodTypeCounts);
                        setLabelText("Donated Food Type Items");
                    } else if (request.receivedBy === userId) {
                        receivedWeight += parseFloat(request.foodWeight) || 0;
                        totalFoodItemsReceived += parseInt(request.foodQuantity) || 0;
                        updateFoodTypeCounts(request, foodTypeCounts);
                        setLabelText("Received Food Type Items");
                    } else if (request.deliveredBy === userId) {
                        console.log("wow");
                        deliveredWeight += parseFloat(request.foodWeight) || 0;
                        totalFoodItemsDelivered += parseInt(request.foodQuantity) || 0;
                        updateFoodTypeCounts(request, foodTypeCounts);
                        setLabelText("Delivered Food Type Items");
                    }
                });
            }

            console.log("Donated Weight:", donatedWeight);
            console.log("Received Weight:", receivedWeight);
            console.log("Delivered Weight:", deliveredWeight);
            console.log("Food Type Counts:", foodTypeCounts);
            console.log(labelText);

            setFoodInfo({
                donatedWeight,
                receivedWeight,
                deliveredWeight,
                totalFoodItemsDonated,
                totalFoodItemsReceived,
                totalFoodItemsDelivered,
                foodTypeCounts,
            });
        });
    };

    const updateFoodTypeCounts = (request, foodTypeCounts) => {
        if (request.foodType) {
            const foodType = request.foodType || 'Other';
            const index = ['Canned Food', 'Fresh Produce', 'Packaged Meals', 'Fruits & Vegetables', 'Bakery Items', 'Beverages', 'Baby Food'].indexOf(foodType);
            if (index !== -1) {
                foodTypeCounts[index] += parseInt(request.foodQuantity) || 0;
            }
        }
    };

    const handleEditClick = () => {
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleEditCancel = () => {
        setIsEditMode(false);
        setIsModalOpen(false);
    };

    const handleEditSubmit = async (updatedUserInfo) => {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);

        await update(userRef, updatedUserInfo);

        setUserInfo(updatedUserInfo);
        setIsEditMode(false);
        setIsModalOpen(false);
    };

    useEffect(() => {
        // Listen for changes in authentication state
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}`);
                onValue(userRef, (snapshot) => {
                    const userData = snapshot.val();

                    console.log(userData);
                    if (userData && userData.first_name) {

                        setUserInfo({
                            userName: capitalizeFirstLetter(userData.first_name),
                            userRole: capitalizeFirstLetter(userData.account_type),
                            phone: userData.phone || 'Not provided',
                            address: userData.address || 'Not provided',
                            firstName: capitalizeFirstLetter(userData.first_name),
                            lastName: capitalizeFirstLetter(userData.last_name),
                        });
                    }
                });
                fetchDonationData();
            } else {
                setUserId(null);
                setUserInfo({
                    userName: null,
                    userRole: null,
                    phone: null,
                    address: null,
                    firstName: null,
                    lastName: null,
                });
                setFoodInfo({
                    donatedWeight: 0,
                    receivedWeight: 0,
                    deliveredWeight: 0,
                    totalFoodItemsDonated: 0,
                    totalFoodItemsReceived: 0,
                    totalFoodItemsDelivered: 0,
                    foodTypeCounts: Array(7).fill(0),
                });
                setRoleCounts([0, 0, 0]);
            }
        });
        return () => unsubscribe();
    }, []);

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <>
            <div className="container-fluid pb-3">
                <div className="row">
                    <NavigateSidebar userName={userInfo.userName} />
                    <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">

                        {/* User Information */}
                        <div className="row mt-2 ">
                            <div className="col-md-12">
                                <h2 className='title mb-3 text-center text-secondary '>Personal Information</h2>
                                {isEditMode ? (
                                    <EditProfileForm
                                        userInfo={userInfo}
                                        isOpen={isModalOpen}
                                        onCancel={handleEditCancel}
                                        onSubmit={handleEditSubmit}
                                    />
                                ) : (

                                    <div className="container text-center pb-3 mb-3">
                                        <div className="row">
                                            <div className="col-md-7 ">
                                                <div className="user-info-box" style={{ backgroundColor: "#e9ecef", padding: "20px" }}>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p>
                                                                <strong>Full Name:</strong> {userInfo.firstName} {userInfo.lastName}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <p>
                                                                <strong>Account Type:</strong> {userInfo.userRole}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p>
                                                                <strong>Phone Number:</strong> {userInfo.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <button onClick={handleEditClick} className="btn btn-primary">Edit</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};


export default Analytics;
