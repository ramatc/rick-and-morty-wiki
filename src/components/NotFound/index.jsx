import './styles.css'

const NotFound = ({ message = 'No Characters Found' }) => {
  return (
    <>
      <div className='not-found'>
        <span>{message}</span>
        <span>{message}</span>
      </div>

      <div className='hole'>
        <div id='first'>
          <div id='second'>
            <div id='third' />
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound
