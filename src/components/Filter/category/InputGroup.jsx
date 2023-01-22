const InputGroup = ({ name, setId, total }) => {
    return (
        <>
            <select
                onChange={(e) => setId(e.target.value)}
                id={name}
            >
                <option value='1'>Choose...</option>
                {[...Array(total).keys()].map(num =>
                    <option value={num + 1} key={num}>
                        {name} - {num + 1}
                    </option>
                )}
            </select>
        </>
    )
};

export default InputGroup;