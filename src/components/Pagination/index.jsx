import ReactPaginate from 'react-paginate';
import './styles.css';

const Pagination = ({ info, pageNumber, setPageNumber }) => {

    const handleChangePage = (data) => {
        setPageNumber(data.selected + 1);
    }

    return (
        <>
            {
                info === undefined
                    ? <></>
                    : <ReactPaginate
                        className='pagination'
                        nextLabel='Next'
                        previousLabel='Prev'
                        previousClassName='prev'
                        nextClassName='next'
                        activeClassName='active'
                        pageClassName='page-item'
                        pageLinkClassName='page-link'
                        forcePage={pageNumber === 1 ? 0 : pageNumber - 1}
                        pageCount={info?.pages ?? 1}
                        onPageChange={handleChangePage}
                    />
            }
        </>
    )
}

export default Pagination;