import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { AppState } from '../../states';
import { Actions } from '../../states/CustomTaskListState';
import CustomTaskList from './CustomTaskList';

export interface StateToProps {
  isOpen: boolean;
}

export interface DispatchToProps {
  dismissBar: () => void;
}

const mapStateToProps = (state: AppState): StateToProps => ({
  isOpen: state['pay-20'].customTaskList.isOpen,
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchToProps => ({
  dismissBar: bindActionCreators(Actions.dismissBar, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomTaskList);
