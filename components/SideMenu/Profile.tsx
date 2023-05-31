
import { useContext } from 'react'
import { AppStateCtx } from '../../pages'
import styles from '../../styles/SideMenu.module.css'


const Profile = (): JSX.Element => {

    const { state, setState } = useContext(AppStateCtx)



    return (
        <div className={styles.user_card}>
            <div className={styles.user_pic_container}>
                <img
                    src="profile.png" alt=""
                    draggable={false}
                    onDragStart={e => e.preventDefault()} // Firefox support
                />
            </div>
            <div className={styles.user_status_container}>
                <span>{state.user?.name.first.toUpperCase()} {state.user?.name.last.toLocaleUpperCase()}</span>
                <span>Online</span>
            </div>
        </div>
    )
}

export default Profile