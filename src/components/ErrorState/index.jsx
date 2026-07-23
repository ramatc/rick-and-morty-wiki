import './styles.css'

const ErrorState = ({ title = 'Something went wrong', message, action }) => {
  return (
    <div className='error-state' role='alert'>
      <div className='error-state-hole'>
        <div id='first'>
          <div id='second'>
            <div id='third' />
          </div>
        </div>
      </div>

      <h2 className='error-state-title'>{title}</h2>
      {message && <p className='error-state-message'>{message}</p>}
      {action && <div className='error-state-action'>{action}</div>}
    </div>
  )
}

export default ErrorState
