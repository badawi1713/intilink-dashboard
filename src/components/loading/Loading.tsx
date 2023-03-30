import styles from './Loading.module.css';

const Loading = () => {
  return (
    <section className={styles['loader-container']}>
      <div className={styles['lds-facebook']}>
        <div />
        <div />
        <div />
      </div>
    </section>
  );
};

export default Loading;
