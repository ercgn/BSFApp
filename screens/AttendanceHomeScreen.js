import React from 'react';
import { ScrollView, View, Alert, Text, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox, Button } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import DatePicker from 'react-native-datepicker';
import { EventRegister } from 'react-native-event-listeners';

export default class AttendanceHomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('考勤表'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    data: null,
    busy: false,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    this.props.navigation.addListener('willFocus', () => {
      this.loadAsync();
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(`${Models.HostServer}/attendanceSummary/`, getCurrentUser().getCellphone(), 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        this.setState({ data: result.body });
        console.log('loadAsync: ' + JSON.stringify(this.state));
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  getRate(lesson) {
    let result = null;
    const attendance = this.state.data.attendance;
    for (let i in attendance) {
      if (attendance[i].lesson === lesson) {
        if (!result) {
          result = `${attendance[i].rate}%`;
        } else {
          return '*';
        }
      }
    }

    if (!result) {
      return '-';
    }

    return result;
  }

  render() {
    if (!this.state.data) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size='large'
          color={Colors.yellow} />
      );
    }

    let keyIndex = 0;
    const lessons = Array.from(Array(29).keys());
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10 }}>
            {
              lessons.map(lesson => {
                const title = `第${lesson + 1}课`;
                return (
                  <TouchableOpacity
                    key={keyIndex++}
                    onPress={() => this.props.navigation.navigate('AttendanceGroup', { lesson: lesson, lessonTitle: title, data: this.state.data })}>
                    <View style={{
                      width: (this.state.windowWidth / 4 - 15),
                      borderColor: '#cdcdcd',
                      borderWidth: 0.5,
                      borderRadius: 10,
                      height: 80,
                      margin: 5,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: Colors.yellow
                      }}>{title}</Text>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}>{this.getRate(lesson)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            }
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
      </View >
    );
  }
}