import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const EditProfileModal = ({ onClose }) => {
	const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();

	const [formData, setFormData] = useState({
		fullName: authUser.fullName,
		username: authUser.username,
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Only call update if there are changes
		if (formData.fullName !== authUser.fullName || formData.username !== authUser.username) {
			// The updateProfile action now handles refetching the user data automatically.
			await updateProfile(formData).catch(() => {}); // .catch is to prevent unhandled promise rejection console warning
		}
		onClose(); // Close modal after submission
	};

	return (
		<dialog id='edit_profile_modal' className='modal modal-open' onClick={onClose}>
			<div className='modal-box bg-gray-800 border border-gray-700' onClick={(e) => e.stopPropagation()}>
				<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2' onClick={onClose}>
					✕
				</button>
				<h3 className='font-bold text-lg text-white'>Edit Profile</h3>
				<form onSubmit={handleSubmit} className='py-4 space-y-4'>
					<div>
						<label className='label p-2'>
							<span className='text-base label-text text-gray-300'>Full Name</span>
						</label>
						<input
							type='text'
							name='fullName'
							value={formData.fullName}
							onChange={handleChange}
							className='w-full input input-bordered h-10 bg-gray-700 text-white'
						/>
					</div>
					<div>
						<label className='label p-2'>
							<span className='text-base label-text text-gray-300'>Username</span>
						</label>
						<input
							type='text'
							name='username'
							value={formData.username}
							onChange={handleChange}
							className='w-full input input-bordered h-10 bg-gray-700 text-white'
						/>
					</div>
					<div className='modal-action mt-6'>
						<button type='submit' className='btn btn-primary' disabled={isUpdatingProfile}>
							{isUpdatingProfile ? <span className='loading loading-spinner'></span> : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</dialog>
	);
};
export default EditProfileModal;