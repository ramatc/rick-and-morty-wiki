const InputGroup = ({ name, setId, total }) => {
    return (
        <div>
            <select
                onChange={(e) => setId(e.target.value)}
                id={name}
            >
                <option value='1'>Choose...</option>
                {[...Array(total).keys()].map(x => {
                    return (
                        <option value={x + 1} key={x}>
                            {name} - {x + 1}
                        </option>
                    );
                })}
            </select>
        </div>
    )
};

export default InputGroup;